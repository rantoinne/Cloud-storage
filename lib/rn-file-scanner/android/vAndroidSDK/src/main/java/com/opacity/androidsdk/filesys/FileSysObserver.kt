package com.opacity.androidsdk.filesys

import com.opacity.androidsdk.db.FilesDatabase
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.SyncConfig
import com.opacity.androidsdk.util.EventsManager
import com.opacity.androidsdk.util.RNEvent
import kotlinx.coroutines.*
import timber.log.Timber
import kotlin.collections.ArrayList

internal object FileSysObserver {


  private var _rootScope: CoroutineScope? = null
  private val rootScope: CoroutineScope
    get() = _rootScope!!
  private var _syncConfig: SyncConfig = SyncConfig()
  val syncConfig: SyncConfig get() = _syncConfig

  private val volumesObserversList: ArrayList<VolumeObserver> = arrayListOf()
  private var isRunning = false;

  fun setConfig(syncConfig: SyncConfig) {
    Timber.d("setConfig()")
    this._syncConfig = syncConfig
  }

  suspend fun updateConfig(newSyncConfig: SyncConfig) {
    Timber.d("updateConfig()")
    // check whiteListPaths has changed in the new incoming config
    val isWhiteListPathsChanged = newSyncConfig.isWhiteListPathsChanged(_syncConfig)
    // save the new incoming config
    this._syncConfig = newSyncConfig
    //
    if (isWhiteListPathsChanged) {
      Timber.d("whitelistPaths has been changed, then update volume observers")
      for (volumeObserver in volumesObserversList) {
        volumeObserver.parseWhitelistPaths(newSyncConfig.getWhiteListPaths())
      }
    } else {
      //notify RN that no new scan is needed because whiteListPaths has not changed
      EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_NO_SCAN)
    }
  }

  fun observeStorageVolume(
    storageVolume: FileSystemStorageVolume,
    whiteListedPaths: MutableList<FileInfo>
  ) {
    Timber.d("observeStorageVolume()")
    Timber.d("storageVolume: $storageVolume - whiteListedPaths: $whiteListedPaths")

    //Create a root scope for the filesystem if null
    if (_rootScope == null) {
      _rootScope = CoroutineScope(Dispatchers.Main + Job())
    }

    //
    isRunning = true

    //
    val volumeObserver = VolumeObserver(
      rootScope,
      storageVolume,
      whiteListedPaths,
      object : VolumeObserverEvents {
        override suspend fun onFileCreated(file: FileInfo) {
          Timber.d("onFileCreated() - file: $file")

          try {
            file.sha256Hash = FilesChecksum.calculateSHA256Hash(file)
            Timber.d("file.sha256Hash: ${file.sha256Hash}")
            //
            FilesDatabase.addFile(file)
          } catch (e: Exception) {
            Timber.d("onFileCreated() - failed - error: $e - path: $file")
            Timber.e("onFileCreated() - failed - error: $e - path: $file")
          }

        }

        override suspend fun onFileModified(file: FileInfo) {
          Timber.d("onFileModified() - file: $file")

          try {
            file.sha256Hash = FilesChecksum.calculateSHA256Hash(file)
            Timber.d("file.sha256Hash: ${file.sha256Hash}")
            //
            file.change = Change.MODIFIED
            //
            FilesDatabase.updateFileHash(file)
            //
            val lastRNPath = FilesDatabase.getFileLastReactNativePath(file.fileKey)
            val filePath = if (lastRNPath.isEmpty()) file.path else lastRNPath
            //notify RN that a file is modified
            EventsManager.sendFileChangeRNEvent(filePath, file.length())
          } catch (e: Exception) {
            Timber.d("onFileModified() - failed - error: $e - path: $file")
            Timber.e("onFileModified() - failed - error: $e - path: $file")

          }


        }

        override suspend fun onFileMoved(oldFile: FileInfo, newFile: FileInfo) {
          Timber.d("onFileMoved()")
          Timber.d("oldFile: $oldFile - newFile: $newFile")

          FilesDatabase.updateFilePath(oldFile, newFile)
        }

        override suspend fun onFileRenamed(oldFile: FileInfo, newFile: FileInfo) {
          Timber.d("onFileRenamed()")
          Timber.d("oldFile: $oldFile - newFile: $newFile")

          FilesDatabase.updateFileName(oldFile, newFile)
        }

        override suspend fun onFileDeleted(file: FileInfo) {
          Timber.d("onFileDeleted() - file: $file")

          //
          FilesDatabase.deleteFile(file)
        }

        override suspend fun onDirCreated(
          file: FileInfo,
          subFilesList: MutableList<FileInfo>
        ) {
          Timber.d("onDirCreated() - file: $file")
          Timber.d("subFilesFolderList.size: ${subFilesList.size}")
          //
          FilesDatabase.addFile(file)

          //add dir sub files/folders to db
          if (subFilesList.isNotEmpty()) {
            //
            FilesDatabase.addFiles(subFilesList)

            //
            val filesList = mutableListOf<FileInfo>()
            subFilesList.forEach {
              if (!it.isDirectory) {
                filesList.add(it)
              }
            }

            if (filesList.isNotEmpty()) {
              //
              FilesChecksum(rootScope).hashFiles(filesList) {

                //
                for (fileHash in it) {
                  Timber.d("hash: ${fileHash.sha256Hash} - file: ${fileHash.name}")
                }

                //
                rootScope.launch(Dispatchers.IO) {
                  Timber.d("Start updating files hashing in db")
                  FilesDatabase.updateFilesHash(filesList)
                  Timber.d("Finished updating files hashing in db")
                }

              }
            }
          }

        }

        override suspend fun onDirMoved(oldFile: FileInfo, newFile: FileInfo) {
          Timber.d("onDirMoved()")
          Timber.d("oldFile: $oldFile - newFile: $newFile")

          //
          FilesDatabase.updateDirPath(oldFile, newFile)
        }

        override suspend fun onDirRenamed(oldFile: FileInfo, newFile: FileInfo) {
          Timber.d("onDirRenamed()")
          Timber.d("oldDir: $oldFile - newFile: $newFile")

          FilesDatabase.updateDirName(oldFile, newFile)
        }

        override suspend fun onDirDeleted(file: FileInfo) {
          Timber.d("onDirDeleted() - file: $file")
          //
          FilesDatabase.deleteFile(file)
          //
          FilesDatabase.deleteDirSubFilesFolder(file)
        }

        override suspend fun onFileSystemScan(
          dirsList: MutableList<FileInfo>,
          filesList: MutableList<FileInfo>
        ) {

          Timber.d("onFileSystemScan()")
          Timber.d("onFileSystemScan - dirsList.size: ${dirsList.size} - ${dirsList.hashCode()}")
          Timber.d("onFileSystemScan - dirsList: $dirsList")
          Timber.d("onFileSystemScan - filesList.size: ${filesList.size} - ${filesList.hashCode()}")
          Timber.d("onFileSystemScan - filesList: $filesList")

          //
          FilesDatabase.addFiles(dirsList)
          //
          FilesDatabase.addFiles(filesList)

          //
          FilesChecksum(rootScope, isAsync = false).hashFiles(filesList) {

            //
            for (file in it) {
              Timber.d("hash: ${file.sha256Hash} - file: ${file.name}")
            }

            //
            withContext(Dispatchers.IO) {
              Timber.d("Start updating files hashing in db")
              FilesDatabase.updateFilesHash(filesList)
              Timber.d("Finished updating files hashing in db")
            }

          }

        }
      })

    //
    volumesObserversList.add(volumeObserver)
    //
    volumeObserver.start()

  }

  fun stopObserving() {
    Timber.d("stopObserving()")
    _rootScope?.let {
      if (it.isActive) {
        it.cancel()
      }
    }
    _rootScope = null

    //
    for (volumeObserver in volumesObserversList) {
      volumeObserver.stop()
    }
    //
    volumesObserversList.clear()
    //
    isRunning = false
  }

  fun isRunning(): Boolean = isRunning
}
