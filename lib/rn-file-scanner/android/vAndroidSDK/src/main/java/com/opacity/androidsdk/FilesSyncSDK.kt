package com.opacity.androidsdk

import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReadableArray
import com.opacity.androidsdk.db.FilesDatabase
import com.opacity.androidsdk.db.data.*
import com.opacity.androidsdk.db.entity.SyncConfig
import com.opacity.androidsdk.db.entity.SortBy
import com.opacity.androidsdk.service.FilesSyncService
import kotlinx.coroutines.*
import com.opacity.androidsdk.db.entity.FileRecord
import com.opacity.androidsdk.db.entity.FileStatus
import com.opacity.androidsdk.filesys.*
import com.opacity.androidsdk.filesys.FileInfo
import com.opacity.androidsdk.filesys.FileSystemStorageVolume
import com.opacity.androidsdk.filesys.StorageVolumes
import com.opacity.androidsdk.util.EventsManager
import timber.log.Timber
import java.lang.ref.WeakReference

class FilesSyncSDK {

  private var isInitialized = false;
  private val rootScope = CoroutineScope(Dispatchers.Main + Job())
  private var _contextWeakReference: WeakReference<Context>? = null
  val contextWeakReference: WeakReference<Context>?
    get() = _contextWeakReference

  init {
    //
    Timber.d("FilesSyncSDK - init - $this")
  }

  private suspend fun initialize(context: Context) {
    Timber.d("initialize() - $VERSION")
    try {
      //
      _contextWeakReference = WeakReference(context)
      //
      withContext(Dispatchers.IO) {
        FilesDatabase.init(context)
        //FilesDatabase.checkAllFilesKeysAndDeleteExpired()
      }
      Timber.d("starting service")
      //
      withContext(Dispatchers.Main) {
        startFilesSyncService(context)
      }
      //
      isInitialized = true
      Timber.d("SDK init finished!")
    } catch (e: Exception) {
      Timber.d("initialization failed - error: $e")
    }

  }

  private fun startFilesSyncService(context: Context) {
    Timber.d("startFilesSyncService()")
    //
    Intent(context, FilesSyncService::class.java).also { intent ->
      context.startService(intent)
    }
  }

  companion object {
    private const val VERSION = "OpacityAndroidSDK v1.1.9-beta"

    const val ACTION_SCAN_STATUS = EventsManager.ACTION_SCAN_STATUS
    const val ACTION_SCAN_STATUS_EXTRA = EventsManager.ACTION_SCAN_STATUS_EXTRA
    const val ACTION_FILE_CHANGED = EventsManager.ACTION_FILE_CHANGED
    const val ACTION_FILE_CHANGED_FILE_PATH_EXTRA =
      EventsManager.ACTION_FILE_CHANGED_FILE_PATH_EXTRA
    const val ACTION_FILE_CHANGED_FILE_SIZE_EXTRA =
      EventsManager.ACTION_FILE_CHANGED_FILE_SIZE_EXTRA

    private var primaryStorage: FileSystemStorageVolume? = null
    val instance = FilesSyncSDK()


    private suspend fun init(
      context: Context
    ) {
      //
      Timber.d("init")
      //
      instance.initialize(context)

      //
      primaryStorage = StorageVolumes().getPrimaryStorage(context)
      Timber.d("primaryStorage: $primaryStorage")

    }

    @JvmStatic
    fun setConfig(
      context: Context,
      config: Config,
      callbackResult: CallbackResult<Boolean>? = null
    ) {
      Timber.d("setConfig")
      //
      instance.rootScope.launch(Dispatchers.Main) {

        Timber.d("instance.isInitialized: ${instance.isInitialized}")
        //initialize the SDK if not initialized yet
        if (!instance.isInitialized) {
          init(context);
        }

        val rowUpdated = FilesDatabase.saveConfig(SyncConfig.parse(config))
        Timber.d("rowUpdated: $rowUpdated")
        //notify true if the new config has been inserted in the db successfully
        if (rowUpdated != -1L) {
          callbackResult?.onResult(true)
        } else {
          callbackResult?.onResult(false)
          Timber.e("setConfig() - failed to update the db with the new config! - rowUpdated is 0!")
        }
      }
    }


    @JvmStatic
    fun getTotalCount(status: String?, callbackResult: CallbackResult<Double>? = null) {
      Timber.d("getTotalCount")

      val fileStatus = FileStatus.parse(status)
      Timber.d("status: $status - parsed: $fileStatus")

      //
      instance.rootScope.launch(Dispatchers.IO) {
        //if null return all files regardless of the file status
        val totalFilesCount = when (fileStatus) {
          null -> FilesDatabase.getTotalFilesCountAllFileStatus()
          FileStatus.DELETED -> FilesDatabase.getTotalFilesCountByFileStatusDeleted()
          else -> FilesDatabase.getTotalFilesCountByFileStatus(fileStatus)
        }

        //
        Timber.d("totalFilesCount: $totalFilesCount")
        callbackResult?.onResult(totalFilesCount.toDouble())
      }
    }

    /*
    * page: Double,
    * dirPath: String,
    * sortBy: String,
    * searchText: String?,
    * */
    @JvmStatic
    fun getFilesInDir(
      getFilesOptions: GetFilesOptions?,
      callbackResult: CallbackResult<FilePageList>? = null
    ) {
      Timber.d("getFilesInDir()")
      Timber.d("getFilesOptions: $getFilesOptions")
      //
      if (getFilesOptions == null) {
        Timber.d("getFilesOptions is null, return dummy response!")
        val dummyFilePageList = FilePageList.dummyFilePageList(0.0)
        callbackResult?.onResult(dummyFilePageList)
        //
        return
      }

      //
      val page = getFilesOptions.page
      val dirPath = getFilesOptions.dirPath
      val sortBy = getFilesOptions.sortBy
      val searchText = getFilesOptions.searchText

      Timber.d("page: $page - dirPath: $dirPath - sortBy: $sortBy - searchText: $searchText")

      //check if the dirPath value is empty then return nothing
      if (dirPath.isEmpty()) {
        Timber.d("dirPath is empty string, return dummy response!")
        val dummyFilePageList = FilePageList.dummyFilePageList(page)
        callbackResult?.onResult(dummyFilePageList)
        //
        return
      }

      val cameraFolderDefaultValue = "/DCIM/Camera/"
      val isContained = dirPath.contains(cameraFolderDefaultValue)
      Timber.d("isContained: $isContained")

      //
      var dirFile = if (dirPath.lowercase().contains(cameraFolderDefaultValue.lowercase())) {
        //For Testing Purposes
        //FileInfo(VolumeObserver.testInternalStorageDir + "/DCIM/Camera/") ?: FileInfo(dirPath)
        primaryStorage?.getCameraFolder() ?: FileInfo(dirPath)
      } else {
        FileInfo(dirPath)
      }
      //
      val sortByVal = SortBy.parse(sortBy)

      Timber.d("dirFile: $dirFile")
      Timber.d("sortByVal: $sortByVal")

      instance.rootScope.launch(Dispatchers.IO) {

        var dirFileRecord: FileRecord? = FilesDatabase.getFileByLastReactNativePath(dirFile)
        Timber.d("LastReactNativePath: fileRecord: $dirFileRecord")

        //
        if (dirFileRecord == null) {
          dirFileRecord = FilesDatabase.getFileByPath(dirFile)
          Timber.d("getFileByPath: fileRecord: $dirFileRecord")

        }

        if (dirFileRecord == null) {
          Timber.d("no file record found for this dir, return dummy response!")
          val dummyFilePageList = FilePageList.dummyFilePageList(page)
          callbackResult?.onResult(dummyFilePageList)
          //
          return@launch
        }


        val filesList = FilesDatabase.getDirChildrenSortByAndMatchSearch(
          dirFile,
          sortByVal,
          searchText ?: ""
        )

        Timber.d("==============")
        Timber.d("filesList.size: ${filesList.size}")
        filesList.forEachIndexed { index, partialFileRecord ->
          Timber.d("index: $index - path: ${partialFileRecord.path}")
        }
        //
        val pageMax = 25
        val pageNum = page.toInt()
        var startIndex = if (pageNum == 1) 0 else ((pageNum - 1) * pageMax)
        Timber.d("pageNum: $pageNum - startIndex: $startIndex")

        if (startIndex >= filesList.size) {
          Timber.d("startIndex > filesList.size, no more files to send, return dummy FilePageList")
          val dummyFilePageList = FilePageList.dummyFilePageList(page)
          callbackResult?.onResult(dummyFilePageList)
          //
          return@launch
        }

        val filesOfPage = mutableListOf<File>()
        val filesRecordsOfPage = mutableListOf<PartialFileRecord>()
        var endIndex = (startIndex + pageMax) - 1
        Timber.d("endIndex: $endIndex")

        for (index in startIndex..endIndex) {
          if (index >= filesList.size) {
            Timber.d("Index: $index - reach max of the fileList, break")
            endIndex = index
            break
          }
          val fileRecord = filesList[index]
          val file = File.parse(fileRecord)
          //
          Timber.d("index: $index - file: $file")
          //
          filesRecordsOfPage.add(fileRecord)
          filesOfPage.add(file)
        }
        //increase startIndex and endIndex by 1 to not be 0 index
        startIndex += 1
        endIndex = (startIndex + filesOfPage.size) - 1
        Timber.d("pageFilesList.size: ${filesOfPage.size} - startIndex: $startIndex - endIndex: $endIndex")
        //
        val filePageList = FilePageList(
          filesOfPage.toTypedArray(),
          startIndex.toDouble(),
          endIndex.toDouble(),
          page
        )

        //
        callbackResult?.onResult(filePageList)

        //important to update the last react native path field of the file records in the db after send them
        // to the React Native side to save the last files paths that React Native side has been received
        // to use them later as reference if the file has been renamed or moved on the native side
        if (filesRecordsOfPage.isNotEmpty()) (
                FilesDatabase.updateFilesLastRNPath(filesRecordsOfPage)
                )

      }
    }

    @JvmStatic
    fun updateFilesStatus(
      filesList: ReadableArray?,
      callbackResult: CallbackResult<Boolean>? = null
    ) {
      Timber.d("updateFilesStatus()")
      Timber.d("filesList.size: ${filesList?.size()}")

      // if the dirPath value is empty then return nothing
      if (filesList == null || filesList.size() == 0) {
        Timber.d("filesList is empty, return success response!")
        callbackResult?.onResult(true)
        return
      }

      val fileRecords = mutableListOf<FileStatusRecord>()
      for (i in 0 until filesList.size()) {

        if (!filesList.isNull(i)) {
          val fileStatusRecord = File.parse(filesList.getMap(i))
          if (fileStatusRecord != null) {
            // if ReactNative notified us that a file upload operation failed then
            // we need to update the file status in the local DB to "NEEDS_SYNC"
            if (fileStatusRecord.status == FileStatus.UPLOAD_FAILED) {
              fileStatusRecord.status = FileStatus.NEEDS_SYNC
            }
            fileRecords.add(fileStatusRecord)
          } else {
            Timber.w("file at index $i is null - parse failed")
          }
        }

      }

      Timber.d("fileRecords: $fileRecords")

      if (fileRecords.isEmpty()) {
        Timber.w("fileRecords is empty, parse failed - return failed response!")
        callbackResult?.onResult(false)
        return
      }

      //
      instance.rootScope.launch(Dispatchers.IO) {

        //
        FilesDatabase.updateFilesStatusByLastRNPath(fileRecords)
        //
        callbackResult?.onResult(true)
      }
    }

    @JvmStatic
    fun cleanDB(
      callbackResult: CallbackResult<Boolean>? = null
    ) {
      Timber.d("cleanDB()")

      //
      instance.rootScope.launch(Dispatchers.IO) {

        //Remove all files records that marked as deleted completely from DB
        FilesDatabase.removeAllRecordsMarkedAsDeleted()

        //update all files with file status UPLOAD_IN_PROGRESS to NEEDS_SYNC
        FilesDatabase.updateAllFileStatusUploadInProgressToNeedsSync()
        //
        callbackResult?.onResult(true)
      }
    }

  }
}

interface CallbackResult<T> {
  fun onResult(result: T)
}