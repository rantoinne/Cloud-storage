package com.opacity.androidsdk.filesys


import com.opacity.androidsdk.db.FilesDatabase
import com.opacity.androidsdk.util.EventsManager
import com.opacity.androidsdk.util.RNEvent
import kotlinx.coroutines.*
import timber.log.Timber

internal class VolumeObserver(
  private val rootScope: CoroutineScope,
  private val storageVolume: FileSystemStorageVolume,
  private var whiteListedPaths: MutableList<FileInfo>,
  private val callback: VolumeObserverEvents
) {


  private var isObserving = false
  private val dirsObservers: HashMap<String, DirObserver> = hashMapOf()

  private var fileSystemScanStatus: ScanStatus = ScanStatus.NO_SCAN
  private var fileSystemFiles: MutableList<FileInfo>? = null
  private var fileSystemDirs: MutableList<FileInfo>? = null

  private val allFilePendingOperations: HashMap<String, MutableList<FileOperation>> = hashMapOf()
  private val filesOperationsList: MutableList<FileOperation> = mutableListOf()
  private var parsingLoopJob: Job? = null
  private var updateWhitelistPathsJob: Job? = null
  private var cameraFolderExistsJob: Job? = null

  init {
    Timber.d("init - storageVolume: $storageVolume")
    Timber.d("whiteListedPaths: $whiteListedPaths")
  }

  fun start() {
    Timber.d("start()")
    if (isObserving) {
      Timber.d("already observing - ignore!")
      return
    }

    if (!storageVolume.dir.exists()) {
      Timber.d("storage volume directory is not exists - ignore!")
      return
    }

    //
    startParsingLoop()

    //
    rootScope.launch(Dispatchers.IO) {
      Timber.d("${storageVolume.name} - Start Storage Volume Scanning!")

      //
      isObserving = true
      //
      observeAndScanDirs(listOf(storageVolume.dir), whiteListedPaths)
      //
      if (storageVolume.isPrimary) {
        loopUntilCameraFolderExists()
      }
    }

  }

  fun stop() {
    Timber.d("stop()")

    //stop all fileObservers
    for (observer in dirsObservers) {
      observer.value.stop()
    }
    //
    isObserving = false
    //
    parsingLoopJob?.let {
      if (it.isActive) {
        it.cancel()
      }
    }
    //
    updateWhitelistPathsJob?.let {
      if (it.isActive) {
        it.cancel()
      }
    }

    //
    cameraFolderExistsJob?.let {
      if (it.isActive) {
        it.cancel()
      }
    }

    //clean
    dirsObservers.clear()
    fileSystemDirs?.clear()
    fileSystemFiles?.clear()
    allFilePendingOperations.clear()
    filesOperationsList.clear()

  }

  private suspend fun observeAndScanDirs(
    dirs: List<FileInfo>,
    whiteListedPaths: List<FileInfo>
  ) {
    Timber.d("observeAndScanDirs() \n dirs: $dirs")

    fileSystemScanStatus = ScanStatus.RUNNING
    fileSystemFiles = mutableListOf()
    fileSystemDirs = mutableListOf()
    //notify RN that files scanning is running
    EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_RUNNING)

    //
    for (dir in dirs) {

      // ignore add storage volume main dir to fileSystemDirs as it's the root directory
      if (dir.path != storageVolume.dir.path) {
        fileSystemDirs?.add(dir)
      }

      observeAndScanDirRecursive(dir, whiteListedPaths) { fileFound ->
        //
        if (fileFound.isDirectory) {
          fileSystemDirs?.add(fileFound)
        } else {
          //
          fileSystemFiles?.add(fileFound)
        }
      }
    }
    //
    Timber.d("fileSystemDirs.hashCode:${fileSystemDirs.hashCode()}")
    Timber.d("fileSystemFiles.hashCode:${fileSystemFiles.hashCode()}")
    Timber.d("dirsObservers.size:${dirsObservers.size}")
    callback.onFileSystemScan(fileSystemDirs!!, fileSystemFiles!!)
    Timber.d("Volume Filesystem scanning has finished!")
    fileSystemScanStatus = ScanStatus.FINISHED
    //notify RN that files scanning is finished
    EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_FINISHED)
    //
    Timber.d("Updated files in DB")
  }

  /*
  * Recursive Observe and scanning dir and its sub-dirs
  * */
  private fun observeAndScanDirRecursive(
    dir: FileInfo,
    whiteListedPaths: List<FileInfo> = this.whiteListedPaths,
    onFileFound: ((FileInfo) -> Unit)? = null
  ) {
    //Timber.d("observeAndScanDirRecursive()")
    //Timber.d("dir: $dir -  isExists: ${dir.exists()}")

    if (!dir.exists()) {
      Timber.d("dir doesn't exists then ignore, return!")
      return
    }

    if (dir.isWhiteListed(whiteListedPaths)) {
      Timber.d("observe dir - found in the whitelistPaths! - dir: $dir")
      //
      observeDir(dir)
    }

    //
    val filesList = dir.listFiles()
    if (filesList == null) {
      Timber.d("dir: $dir - filesList is null - return!")
      return
    }

    //recursive until observing all the sub-folders
    for (file in filesList) {

      //
      if (file.isHiddenFile()) {
        Timber.d("ignore hidden file: $file - isDir: ${file.isDirectory}")
        // ignore system hidden files which its name start with .
        // i.e path/.sys
        // i.e path/.thumbnails
        // etc
        continue
      }

      // if files scanning is running then notify callback to add file/folder to the files list to update the db
      if (fileSystemScanStatus == ScanStatus.RUNNING && file.isWhiteListed(whiteListedPaths)) {
        if (onFileFound != null) onFileFound(file)
      }

      //if it's a directory observe and scan
      if (file.isDirectory) {
        observeAndScanDirRecursive(file, whiteListedPaths, onFileFound)
      }
    }

  }

  private fun observeDir(dir: FileInfo) {
    //Timber.d("observeDir()")
    //Timber.d("dir.path: ${dir.path}")

    if (dirsObservers.containsKey(dir.path)) {
      Timber.d("Dir is already observed then ignore")
      return
    }

    val dirObserver = DirObserver(dir) { fileOperation ->
      Timber.d("added new fileOperation to the queue")
      //
      filesOperationsList.add(fileOperation)
    }

    //
    dirObserver.start()

    //SAVE Observer
    dirsObservers[dir.path] = dirObserver
  }

  //Recursive Dir Scanning
  private fun scanDir(dir: FileInfo, subFilesList: MutableList<FileInfo>) {
    Timber.d("scanDir()")

    //
    val filesList = dir.listFiles()

    if (filesList == null) {
      Timber.d("dir: $dir - filesList is null - return!")
      return
    }

    //recursive until observing all the sub-folders
    for (file in filesList) {
      val fileInfo = FileInfo(file)
      subFilesList.add(fileInfo)
      if (!fileInfo.isHiddenFile() && fileInfo.isDirectory) {
        scanDir(file, subFilesList)
      }
    }
  }

  private suspend fun parseFileOperation(fileOperation: FileOperation) {
    Timber.d("parseFileOperation()")

    //
    when (fileOperation.event) {

      FileEvent.CREATE -> {

        Timber.d("FileEvent.CREATED - fileOperation: $fileOperation")

        //
        notifyOnCreate(fileOperation)

      }

      FileEvent.MODIFY -> {
        Timber.d("FileEvent.MODIFIED - fileOperation: $fileOperation")

        //
        val filePendingOperationsList: MutableList<FileOperation> =
          if (allFilePendingOperations.containsKey(fileOperation.fileKey)) {
            //if file has already an existed list then return
            allFilePendingOperations[fileOperation.fileKey]!!
          } else {
            //create a new list because it doesn't exists
            val list = mutableListOf<FileOperation>()
            //save it
            allFilePendingOperations[fileOperation.fileKey] = list
            //return the created list
            list
          }

        Timber.d("filePendingOperationsList.size: ${filePendingOperationsList.size}")
        Timber.d("filePendingOperationsList: $filePendingOperationsList")

        var lastModifyOperation: FileOperation? = null

        //
        for (pendingOperation in filePendingOperationsList) {
          if (pendingOperation.event == FileEvent.MODIFY) {
            Timber.d("Found Modify operation!")
            lastModifyOperation = pendingOperation
          }
        }

        //stop the previous modify event counter if found
        lastModifyOperation?.let {
          it.pendingModifyJob?.cancel()
          //remove from list
          filePendingOperationsList.remove(it)
        }

        //add the new event to the list
        filePendingOperationsList.add(fileOperation)

        //
        modifyFileAfterDelay(fileOperation)


      }

      FileEvent.MOVED_FROM -> {
        Timber.d("FileEvent.MOVED_FROM - fileOperation: $fileOperation")

        //
        if (fileOperation.file.isDirectory) {
          //dir has been moved/rename then we have to stop its fileObserver and its sub-folders observers
          stopObservingDirAndSubDirs(fileOperation.file)
        }

        // MOVE_FROM event file could not has a fileKey because we can't get it as the file has not been exists, renamed or moved
        // we need to fetch the fileKey for this from the local db
        if (fileOperation.fileKey.isNotEmpty()) fileOperation.fileKey else {

          Timber.d("Getting fileKey from DB")
          val result = withContext(Dispatchers.IO) {
            FilesDatabase.getFileKeyByPathIfNotDeleted(fileOperation.file)
          }
          Timber.d("Getting fileKey from DB - result: $result")

          //get fileKey and save it in the fileOperation instance
          fileOperation.updateFileKey(result.firstOrNull() ?: "")
          Timber.d("fileKey: ${fileOperation.fileKey}")
        }

        //
        val filePendingOperationsList: MutableList<FileOperation> =
          if (allFilePendingOperations.containsKey(fileOperation.fileKey)) {
            //if file has already an existed list then return
            allFilePendingOperations[fileOperation.fileKey]!!
          } else {
            //create a new list because it doesn't exists
            val list = mutableListOf<FileOperation>()
            //save it
            allFilePendingOperations[fileOperation.fileKey] = list
            //return the created list
            list
          }


        // MOVE_FROM event means that file/folder has been moved from the current directory we observing
        // , this could mean two cases
        // First case, delete operation which user has moved the file to trash (Not Explicit Delete but still a delete as file will be delete when user clean the trash)
        // Second case, a RENAME/MOVE operation occurred
        // to differentiate between the two cases then once we receive the MOVE_FROM event we will consider it as delete
        // but we won't perform the delete immediately, instead will wait for X amount of milliseconds (i.e 0.5 second)
        // if we received the MOVE_IN event for the same file/folder during this time then it's a RENAME or MOVE operation, if not then it's a delete operation
        //
        filePendingOperationsList.add(fileOperation)
        Timber.d("filePendingOperationsList.size: ${filePendingOperationsList.size}")
        Timber.d("filePendingOperationsList: $filePendingOperationsList")

        //
        deleteFileAfterDelay(fileOperation)

      }

      FileEvent.MOVED_TO -> {
        Timber.d("FileEvent.MOVED_TO - fileOperation: $fileOperation")

        //
        val filePendingOperationsList: MutableList<FileOperation>? =
          if (allFilePendingOperations.containsKey(fileOperation.fileKey)) {
            //if file has already an existed list then return
            allFilePendingOperations[fileOperation.fileKey]!!
          } else null

        Timber.d("filePendingOperationsList.size: ${filePendingOperationsList?.size}")
        Timber.d("filePendingOperationsList: $filePendingOperationsList")

        // MOVE_IN event means that file/folder has been moved to the current directory we observing
        // , this could mean two cases
        // First case, RENAME operation, user has renamed the file/folder
        // Second case, MOVE operation occurred
        // to differentiate between the two cases then once we receive the MOVE_IN,
        // we will have to check if there is MOVE_FROM pending operation for this file/folder
        // if yes then this file/folder has RENAMED or MOVED with in the current storage volume that we are observing
        // if no then this fie/folder has been MOVED from another storage volume (a.e SDCard) to the current storage volume that we are observing

        var lastMoveFromOperation: FileOperation? = null

        //
        if (filePendingOperationsList != null) {
          for (pendingOperation in filePendingOperationsList) {
            if (pendingOperation.event == FileEvent.MOVED_FROM) {
              Timber.d("Found MOVE_FROM operation!")
              lastMoveFromOperation = pendingOperation
            }
          }
        }


        if (lastMoveFromOperation != null) {
          Timber.d("lastMoveFromOperation: $lastMoveFromOperation")
          // first we have to stop the pending delete operation as we received MOVE_IN event then operation is not delete
          lastMoveFromOperation.pendingDeleteJob?.cancel()
          // remove the event from the pending operations list of the file as now we consumed
          filePendingOperationsList?.remove(lastMoveFromOperation)

          // we have to detect if the operation is RENAME or MOVE
          // if the file's parent is the same in the two operation then it's a RENAME operation
          // if the file's parent is not the same then it's a MOVE operation
          val lastParent = lastMoveFromOperation.file.parent
          val currentParent = fileOperation.file.parent
          //Timber.d("lastParent: $lastParent - currentParent: $currentParent")
          if (lastParent == currentParent) {
            Timber.d("RENAME operation - currentThreadName: ${Thread.currentThread().name}")

            //run in different thread as it's blocking db operation
            withContext(Dispatchers.IO) {
              //
              if (fileOperation.file.isDirectory) {
                //
                callback.onDirRenamed(
                  lastMoveFromOperation.file,
                  fileOperation.file
                )
                //observe new dir and scan recursively to observe any sub dirs
                observeAndScanDirRecursive(fileOperation.file)
              } else {
                //
                callback.onFileRenamed(
                  lastMoveFromOperation.file,
                  fileOperation.file
                )
              }
            }

          } else {
            Timber.d("MOVE operation - currentThreadName: ${Thread.currentThread().name}")

            //run in different thread as it's a blocking DB operation
            withContext(Dispatchers.IO) {
              //
              if (fileOperation.file.isDirectory) {
                //
                callback.onDirMoved(lastMoveFromOperation.file, fileOperation.file)
                //observe new dir and scan recursively to observe any sub dirs
                observeAndScanDirRecursive(fileOperation.file)

              } else {
                //
                callback.onFileMoved(lastMoveFromOperation.file, fileOperation.file)
                //
              }
            }

          }

        } else {
          // It's MOVE operation but from another storage volume (i.e SDCard)
          // and not from with in the current storage volume that we are observing,
          // then we will treat it as a new file/folder create operation
          Timber.d("New file/folder has been moved from Another Storage VOLUME then CREATE operation")

          //
          notifyOnCreate(fileOperation)

        }
      }

      FileEvent.DELETE -> {
        Timber.d("FileEvent.DELETE - fileOperation: $fileOperation")

        //run in different thread as it's a blocking db operation
        withContext(Dispatchers.IO) {
          //It's explicit delete event, then notify delete
          if (fileOperation.file.isDirectory) {

            //dir has been deleted then stop observing it and its sub-folder
            stopObservingDirAndSubDirs(fileOperation.file)
            //
            notifyOnDirDelete(fileOperation.file)

          } else {
            //
            callback.onFileDeleted(fileOperation.file)
          }
        }

      }

      FileEvent.NONE -> {

      }
    }

    Timber.d("parsed file operation!")
  }

  private fun deleteFileAfterDelay(fileOperation: FileOperation) {
    Timber.d("deleteFileAfterDelay()")

    fileOperation.pendingDeleteJob = rootScope.launch {
      // we can't delete file immediately because it could be a move/rename operation and not delete
      // so we have to wait for X amount of milliseconds before performing the delete,
      // as we have to wait if MOVE_IN event will come and in this case, the operation is MOVE/RENAME and not a delete
      delay(DELAY_BETWEEN_HANDLING_EVENTS)

      //delete the file operation from the pending list as we will perform it now!
      val filePendingOperationsList: MutableList<FileOperation>? =
        if (allFilePendingOperations.containsKey(fileOperation.fileKey)) {
          //if file has already an existed list then return
          allFilePendingOperations[fileOperation.fileKey]!!
        } else null
      filePendingOperationsList?.remove(fileOperation)


      //
      // Currently file/folder has been moved from the current dir
      // We need to notify that file/ folder has been deleted
      // run in different thread as it's a blocking DB operation
      withContext(Dispatchers.IO) {
        //
        if (fileOperation.file.isDirectory) {

          //
          notifyOnDirDelete(fileOperation.file)
        } else {
          //
          callback.onFileDeleted(fileOperation.file)
        }
      }

    }
  }

  private fun modifyFileAfterDelay(fileOperation: FileOperation) {
    Timber.d("modifyFileAfterDelay()")

    fileOperation.pendingModifyJob = rootScope.launch {
      // we can't notify a modify event immediately because some times a modify event comes multiple times in very short time (20 milliseconds)
      // and notify each modify event will be duplication and waste of resources
      // so we have to wait for X amount of milliseconds before performing the modify,
      delay(DELAY_BETWEEN_HANDLING_EVENTS)

      //delete the file operation from the pending list as we will consume it now!
      val filePendingOperationsList: MutableList<FileOperation>? =
        if (allFilePendingOperations.containsKey(fileOperation.fileKey)) {
          //if file has already an existed list then return
          allFilePendingOperations[fileOperation.fileKey]!!
        } else null
      filePendingOperationsList?.remove(fileOperation)


      // Currently file has been modified, then notify to update DB
      //run in different thread as it's a blocking db operation
      withContext(Dispatchers.IO) {

        if (fileOperation.file.isDirectory) {
          //
          //callback.onDirModified(fileOperation.file)
        } else {
          //
          callback.onFileModified(fileOperation.file)
        }
      }

    }
  }

  private suspend fun notifyOnCreate(fileOperation: FileOperation) {
    Timber.d("notifyOnCreate()")
    //run in different thread as it's a blocking db operation
    withContext(Dispatchers.IO) {
      if (fileOperation.file.isDirectory) {

        val subFilesList = mutableListOf<FileInfo>()
        scanDir(fileOperation.file, subFilesList)
        Timber.d("subFilesList: $subFilesList")
        //
        callback.onDirCreated(fileOperation.file, subFilesList)
        //a new dir has been created, then observe and scan recursively to observe any sub dirs
        observeAndScanDirRecursive(fileOperation.file)
      } else {
        //
        callback.onFileCreated(fileOperation.file)
      }
    }
  }

  private suspend fun notifyOnDirDelete(file: FileInfo) {
    Timber.d("notifyOnDirDelete()")

    //
    callback.onDirDeleted(file)
  }

  private fun startParsingLoop() {
    Timber.d("startParsingLoop()")

    //cancel any previous job to prevent duplication
    parsingLoopJob?.let {
      if (it.isActive) it.cancel()
    }

    //
    parsingLoopJob = rootScope.launch {

      while (true) {

        if (fileSystemScanStatus == ScanStatus.RUNNING) {
          Timber.d("file system scan is running, then wait!")
          delay(1000)
          continue
        }

        if (filesOperationsList.isNotEmpty()) {

          Timber.d("Parsing next operation")
          val fileOperation = filesOperationsList.first()
          filesOperationsList.remove(fileOperation)
          //
          parseFileOperation(fileOperation)
        }

        if (filesOperationsList.isEmpty()) {
          delay(200)
        }

      }

    }

  }


  private fun loopUntilCameraFolderExists() {
    Timber.d("loopUntilCameraFolderExists()")

    val cameraFolderDir = storageVolume.getCameraFolder()

    if (dirsObservers.containsKey(cameraFolderDir.path)) {
      Timber.d("Camera Folder is already observed then return")
      return
    }

    //cancel any previous job to prevent duplication
    cameraFolderExistsJob?.let {
      if (it.isActive) it.cancel()
    }

    //
    cameraFolderExistsJob = rootScope.launch {

      while (true) {
        if (cameraFolderDir.exists()) {
          Timber.d("Camera Folder has been created by the system, then observe!")
          observeAndScanDirs(listOf(cameraFolderDir), whiteListedPaths)
          break
        }

        //
        delay(1000)
      }
      Timber.d("loopUntilCameraFolderExists - finished")
    }

  }

  private fun stopObservingDirAndSubDirs(targetDir: FileInfo) {
    Timber.d("stopObservingDirAndSubDirs()")
    Timber.d("dir: $targetDir")

    //stop observing the target dir
    val observer = findDirObserver(targetDir.path)

    observer?.let {
      it.stop()
      //remove the observer from the observersList
      dirsObservers.remove(targetDir.path)
    }

    val dirsToDelete = arrayListOf<String>()

    for (dirObserver in dirsObservers) {

      if (dirObserver.key.contains(targetDir.path)) {
        Timber.d("Sub-child: ${dirObserver.key}")
        //stop observing the sub-directory and remove it from the observes list
        dirObserver.value.stop()
        //
        dirsToDelete.add(dirObserver.key)
      }
    }

    if (dirsToDelete.isEmpty()) {
      Timber.d("dirsToDelete is empty, return")
      return
    }

    //delete dirs from ObserversList
    for (item in dirsToDelete) {
      dirsObservers.remove(item)
    }
    //
    Timber.d("Deleted observer from dirsObservers list - dirsToDelete.size: ${dirsToDelete.size} - dirsToDelete: $dirsToDelete")
    Timber.d("dirsObservers.size: ${dirsObservers.size}")
  }

  private fun findDirObserver(fullPath: String): DirObserver? {

    return if (dirsObservers.containsKey(fullPath)) {
      Timber.d("found dirObserver - dir: $fullPath")
      dirsObservers[fullPath]
    } else {
      null
    }
  }

  private fun findPath(targetPath: FileInfo, pathsList: List<FileInfo>): FileInfo? {
    for (path in pathsList) {
      if (path.path == targetPath.path) return path
    }
    return null
  }

  private fun removePath(targetPath: FileInfo, pathsList: MutableList<FileInfo>): Boolean {
    val file = findPath(targetPath, pathsList)
    return pathsList.remove(file)
  }

  suspend fun parseWhitelistPaths(newWhitelistPaths: List<FileInfo>) {
    Timber.d("updateWhitelistPaths()")
    Timber.d("newWhitelistPaths: $newWhitelistPaths")
    Timber.d("currentWhitelistPaths: $whiteListedPaths")

    val addedPaths = mutableListOf<FileInfo>()
    val removedPaths = mutableListOf<FileInfo>()
    for (path in newWhitelistPaths) {
      if (!FileInfo.isListContainsPath(whiteListedPaths, path.path)) {
        addedPaths.add(FileInfo(path))
      }
    }
    Timber.d("addedPaths: $addedPaths")

    val cameraFolderDir = storageVolume.getCameraFolder()
    for (path in whiteListedPaths) {

      if (cameraFolderDir.path == path.path) {
        Timber.d("camera folder found - then ignore!")
        continue
      }
      if (!FileInfo.isListContainsPath(newWhitelistPaths, path.path)) {
        removedPaths.add(FileInfo(path))
      }
    }

    Timber.d("removedPaths: $removedPaths")

    if (removedPaths.isNotEmpty()) {
      Timber.d("stop observing removed paths and notify delete to update DB")
      //
      withContext(Dispatchers.IO) {
        for (path in removedPaths) {
          //remove path from the current whiteListedPaths
          removePath(path, whiteListedPaths)
          //dir has been deleted then stop observing it and its sub-folder
          stopObservingDirAndSubDirs(path)
          notifyOnDirDelete(path)
        }
      }
    }

    //
    if (addedPaths.isNotEmpty()) {
      updateWhitelistPaths(addedPaths)
    } else {
      //notify RN that no new scan is needed because no new paths in whiteListPaths to scan
      EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_NO_SCAN)
    }
  }

  private fun updateWhitelistPaths(addedPaths: List<FileInfo>) {
    Timber.d("updateWhitelistPaths()")
    Timber.d("addedPaths: $addedPaths")

    //cancel any previous job to prevent duplication
    updateWhitelistPathsJob?.let {
      if (it.isActive) it.cancel()
    }

    //
    updateWhitelistPathsJob = rootScope.launch(Dispatchers.IO) {

      while (true) {

        if (fileSystemScanStatus == ScanStatus.RUNNING) {
          Timber.d("file system scan is running, then wait!")
          delay(1000)
          continue
        }

        if (addedPaths.isNotEmpty()) {
          whiteListedPaths.addAll(addedPaths)
          Timber.d("Updated whitelistPaths with the new paths!")
          Timber.d("whiteListedPaths: $whiteListedPaths")

          //start filesystem scan for the new added paths
          observeAndScanDirs(addedPaths, whiteListedPaths)

        }
        break
      }

    }

  }

  companion object {
    const val DELAY_BETWEEN_HANDLING_EVENTS = 1000L // 1 sec

    //
    const val testMainDir = "/storage/emulated/0/dummyDemoFileSys"
    const val testInternalStorageDir = "$testMainDir/InternalStorage"
  }
}


internal interface VolumeObserverEvents {

  suspend fun onFileCreated(file: FileInfo)
  suspend fun onFileModified(file: FileInfo)
  suspend fun onFileMoved(oldFile: FileInfo, newFile: FileInfo)
  suspend fun onFileRenamed(oldFile: FileInfo, newFile: FileInfo)
  suspend fun onFileDeleted(file: FileInfo)
  suspend fun onDirCreated(file: FileInfo, subFilesList: MutableList<FileInfo>)
  suspend fun onDirMoved(oldFile: FileInfo, newFile: FileInfo)
  suspend fun onDirRenamed(oldFile: FileInfo, newFile: FileInfo)
  suspend fun onDirDeleted(file: FileInfo)
  suspend fun onFileSystemScan(
    dirsList: MutableList<FileInfo>,
    filesList: MutableList<FileInfo>
  )
}

internal enum class ScanStatus {
  NO_ACCESS, NO_SCAN, RUNNING, FINISHED
}

