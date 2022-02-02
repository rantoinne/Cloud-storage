package com.opacity.androidsdk.db

import android.content.Context
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.opacity.androidsdk.db.data.FileStatusRecord
import com.opacity.androidsdk.db.data.PartialFileRecord
import com.opacity.androidsdk.db.entity.*
import com.opacity.androidsdk.filesys.FileInfo
import com.opacity.androidsdk.util.Util.getMimeType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import timber.log.Timber
import java.util.*
import java.util.concurrent.Executors

internal object FilesDatabase {

  private val lock = Any()
  private var _instance: FilesDatabaseRoom? = null
  private val instance get() = _instance!!
  fun init(context: Context) {
    Timber.d("init() - db instance: $_instance")
    if (_instance == null) {
      synchronized(lock) {
        Timber.d("init db instance")
        try {
          _instance = Room.databaseBuilder(
            context,
            FilesDatabaseRoom::class.java,
            "FilesSyncSDK-database"
          )
            .addCallback(object : RoomDatabase.Callback() {
              override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                Timber.d("RoomDatabase.Callback - onCreate()")
                Executors.newSingleThreadScheduledExecutor()
                  .execute(Runnable {
                    setInitialGeneralSettings()
                  })
              }

              override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
              }

              override fun onDestructiveMigration(db: SupportSQLiteDatabase) {
                super.onDestructiveMigration(db)
              }
            }).build()
          Timber.d("db instance is ready")

        } catch (e: Exception) {
          Timber.d("init db instance - failed - error: $e")
        }

      }
    } else {
      Timber.d("ignore - db instance already initialized")
    }
  }

  private fun destroyInstance() {
    _instance = null
  }

  suspend fun checkAllFilesKeysAndDeleteExpired() {
    Timber.d("checkAllFilesKeysAndDeleteExpired()")
    val filesList = instance.filesDao().getAllFilesKeys()
    Timber.d("filesList.size: ${filesList.size}")

    var expiredFilesKeys = mutableListOf<String>();
    var validFiles = 0;
    for (file in filesList) {
      val isFileKeyExpired = file.fileKey != FileInfo(file.path).fileKey
      if (isFileKeyExpired) expiredFilesKeys.add(file.fileKey) else validFiles += 1
      //Timber.d("fileKey: ${file.fileKey} - isFileKeyExpired: $isFileKeyExpired - path: ${file.path}")
    }
    //
    for (expiredFileKey in expiredFilesKeys) {
      val rowDelete = instance.filesDao().deleteByFileKey(expiredFileKey)
      Timber.d("rowDelete: $rowDelete")
    }
    Timber.d("Scan FilesKeys Finished - expiredFiles: $expiredFilesKeys - validFiles: $validFiles")
  }

  suspend fun deleteAllConfig() {
    Timber.d("deleteAllConfig()")
    val rowId = instance.configDao().deleteAllConfig()
    Timber.d("deleted old config - rowId: $rowId")

  }

  fun getConfig(): Flow<SyncConfig?> {
    Timber.d("getConfig()")
    return instance.configDao().getConfigFlowable()
  }

  suspend fun saveConfig(syncConfig: SyncConfig): Long {
    Timber.d("saveConfig()")
    Timber.d("config: $syncConfig")
    return withContext(Dispatchers.IO) {
      instance.configDao().saveConfig(syncConfig)
    }
  }

  fun setInitialGeneralSettings() {
    Timber.d("setInitialGeneralSettings()")
    val rowID = instance.generalSettingsDao().saveInitialGeneralSettings(GeneralSettings())
    Timber.d("rowID: $rowID")
  }

  suspend fun getTotalFilesCountByFileStatus(fileStatus: FileStatus): Int {
    Timber.d("getTotalFilesCountByFileStatus()")
    Timber.d("fileStatus: $fileStatus")

    val filesList = instance.filesDao().getTotalFilesCountByFileStatus(fileStatus)
    filesList?.let {
      return filesList.size
    }
    return 0
  }

  suspend fun getTotalFilesCountByFileStatusDeleted(): Int {
    Timber.d("getTotalFilesCountByFileStatus()")

    val filesList = instance.filesDao().getTotalFilesCountByFileStatusDeleted()
    filesList?.let {
      return filesList.size
    }
    return 0
  }

  suspend fun getTotalFilesCountAllFileStatus(): Int {
    Timber.d("getTotalFilesCountAllFileStatus()")

    val filesList = instance.filesDao().getTotalFilesCountAllFileStatus()
    filesList?.let {
      return filesList.size
    }
    return 0
  }

  suspend fun getFileByPath(file: FileInfo): FileRecord? {
    Timber.d("getFileByPath()")
    Timber.d("file: $file")

    return instance.filesDao().getFileByPath(file.path)
  }

  suspend fun getCurrentFileStatus(file: FileInfo): FileStatusRecord? {
    Timber.d("getCurrentFileStatus()")
    Timber.d("file:$file - fileKey:${file.fileKey}")
    return instance.filesDao().getCurrentFileStatus(file.fileKey)
  }

  suspend fun getFileByLastReactNativePath(file: FileInfo): FileRecord? {
    Timber.d("getFileByLastReactNativePath()")
    Timber.d("file: $file")
    return instance.filesDao().getFileByLastReactNativePath(file.path)
  }

  suspend fun getFileLastReactNativePath(fileKey: String): String {
    Timber.d("getFileLastReactNativePath()")
    Timber.d("fileKey: $fileKey")
    val lastRNPath = instance.filesDao().getFileLastReactNativePath(fileKey)
    Timber.d("lastRNPath: $lastRNPath")
    return lastRNPath
  }
  suspend fun getDirChildrenSortByAndMatchSearch(
    parentDir: FileInfo,
    sortBy: SortBy?,
    searchTxt: String
  ): List<PartialFileRecord> {
    Timber.d("getDirChildrenSortByAndMatchSearch()")
    Timber.d("parentDir: ${parentDir.path} - sortBy: $sortBy - searchTxt: $searchTxt")

    return when (sortBy) {
      SortBy.NAME -> instance.filesDao()
        .getDirChildrenSortByNameAndMatchSearch(parentDir.path, searchTxt)

      SortBy.TYPE -> instance.filesDao()
        .getDirChildrenSortByTypeAndMatchSearch(parentDir.path, searchTxt)

      SortBy.SIZE -> instance.filesDao()
        .getDirChildrenSortBySizeAndMatchSearch(parentDir.path, searchTxt)

      SortBy.DATE_CREATED -> instance.filesDao()
        .getDirChildrenSortByCreateDateAndMatchSearch(parentDir.path, searchTxt)

      //if sortBy is null then return sort records based on record create date in DB
      null -> instance.filesDao()
        .getDirChildrenSortByRecordCreateDateAndMatchSearch(parentDir.path, searchTxt)
    }
  }

  suspend fun addFile(fileInfo: FileInfo) {
    Timber.d("addFile()")

    instance.filesDao().addFileOrUpdateIFExists(fileInfo)
  }

  suspend fun addFiles(filesList: MutableList<FileInfo>) {
    Timber.d("addFiles()")
    instance.filesDao().addFilesOrUpdateIfExists(filesList)
  }

  suspend fun updateFilesLastRNPath(filesList: MutableList<PartialFileRecord>) {
    Timber.d("updateFilesLastRNPath()")
    instance.filesDao().updateFilesLastRNPath(filesList)
  }

  suspend fun updateFilesStatusByLastRNPath(filesList: MutableList<FileStatusRecord>) {
    Timber.d("updateFilesStatusByLastRNPath()")
    instance.filesDao().updateFilesStatusByLastRNPath(filesList)
  }

  suspend fun updateFilesHash(filesList: MutableList<FileInfo>) {
    Timber.d("updateFilesHash()")
    instance.filesDao().updateFilesHash(filesList)
  }

  suspend fun updateFileHash(fileInfo: FileInfo) {
    Timber.d("updateFileHash()")
    val updatedRow = instance.filesDao().updateFileHashIfChanged(
      fileInfo.fileKey,
      fileInfo.sha256Hash,
      fileInfo.length(),
      FileRecord.getFileStatus(fileInfo),
      fileInfo.change,
      Date()
    )
    Timber.d("updatedRow: $updatedRow")
  }

  suspend fun getFileKeyByPathIfNotDeleted(file: FileInfo): List<String> {
    Timber.d("getFileKeyByPathIfNotDeleted()")
    Timber.d("file: $file - path: ${file.path}")
    //Important, get fileKey using this path if the file change status is not deleted to prevent fetching old deleted file's fileKey with same path
    return instance.filesDao().getFileKeyByPathIfChangeNotEqual(file.path, Change.DELETED)
  }

  suspend fun updateFileName(oldFile: FileInfo, newFile: FileInfo) {
    Timber.d("updateFileName()")
    Timber.d("newFile: $newFile")
    val mimeType = newFile.getMimeType
    val rowID = instance.filesDao().updateFileName(
      newFile.fileKey,
      newFile.path,
      newFile.name,
      mimeType,
      FileRecord.getFileStatus(newFile),
      Change.RENAMED,
      Date()
    )
    Timber.d("Updated file new name in db - rowID: $rowID")
  }

  suspend fun updateFilePath(oldFile: FileInfo, newFile: FileInfo) {
    Timber.d("updateFilePath()")
    Timber.d("newFile: $newFile")
    val mimeType = newFile.getMimeType
    val rowID = instance.filesDao().updateFilePath(
      newFile.fileKey,
      newFile.path,
      newFile.parent,
      newFile.name,
      mimeType,
      FileRecord.getFileStatus(newFile),
      Change.MOVED,
      Date()
    )
    Timber.d("Updated file path in db - rowID: $rowID")
  }

  suspend fun updateDirName(oldDir: FileInfo, newDir: FileInfo) {
    Timber.d("updateDirName()")
    Timber.d("newDir: $newDir")
    instance.filesDao().updateDirNameAndItsSubFiles(oldDir, newDir)
    Timber.d("Updated dir name and its sub files/folders")
  }

  suspend fun updateDirPath(oldDir: FileInfo, newDir: FileInfo) {
    Timber.d("updateDirPath()")
    Timber.d("newDir: $newDir")
    instance.filesDao().updateDirPathAndItsSubFiles(oldDir, newDir)
    Timber.d("Updated dir path and its sub files/folders")
  }

  suspend fun deleteFile(file: FileInfo) {
    Timber.d("deleteFile()")
    Timber.d("file: $file - fileKey: ${file.fileKey}")
    val rowID = instance.filesDao().markFileAsDeleted(file.fileKey, Change.DELETED, Date())
    Timber.d("Marked file as deleted in db - rowID: $rowID")
  }

  suspend fun deleteDirSubFilesFolder(dir: FileInfo) {
    Timber.d("deleteDirSubFilesFolder()")
    Timber.d("dir: $dir")
    val rowIDs = instance.filesDao().markDirChildrenAsDeleted(dir.path, Change.DELETED, Date())
    Timber.d("Marked dir children as deleted in db - rowID: $rowIDs")
  }

  suspend fun removeAllRecordsMarkedAsDeleted() {
    Timber.d("removeAllRecordsMarkedAsDeleted()")
    val rowIDs = instance.filesDao().removeAllRecordsMarkedAsDeleted()
    Timber.d("removed all file marked as deleted completely from db - rowIDs: $rowIDs")
  }

  suspend fun updateAllFileStatusUploadInProgressToNeedsSync() {
    Timber.d("updateAllFileStatusUploadInProgressToNeedsSync()")
    val rowIDs = instance.filesDao().updateAllFileStatusUploadInProgressToNeedsSync()
    Timber.d("updated all files with status UPLOAD_IN_PROGRESS to NEEDS_SYNC - rowIDs: $rowIDs")
  }

  suspend fun updateCameraFilesStatusToNeedsSync(
    cameraFolderDir: String,
    onlyThisMimeTypesList: List<String>,
  ) {
    Timber.d("updateCameraFilesStatusToNeedsSync()")
    Timber.d("cameraFolderDir:$cameraFolderDir")
    Timber.d("onlyThisMimeTypesList:$onlyThisMimeTypesList")

    val updatedRows = instance.filesDao().updateCameraFilesStatus(
      cameraFolderDir,
      oldStatus = FileStatus.NO_SYNC,
      newStatus = FileStatus.NEEDS_SYNC,
      onlyThisMimeTypesList,
      Date(),
      Date().toString()
    )
    Timber.d("update camera files status - updatedRows: $updatedRows")
  }

  suspend fun updateCameraFilesStatusToNoSync(
    cameraFolderDir: String,
    onlyThisMimeTypesList: List<String>,
  ) {
    Timber.d("updateCameraFilesStatusToNoSync()")
    Timber.d("cameraFolderDir:$cameraFolderDir")
    Timber.d("onlyThisMimeTypesList:$onlyThisMimeTypesList")

    val updatedRows = instance.filesDao().updateCameraFilesStatus(
      cameraFolderDir,
      oldStatus = FileStatus.NEEDS_SYNC,
      newStatus = FileStatus.NO_SYNC,
      onlyThisMimeTypesList,
      Date(),
      Date().toString()
    )
    Timber.d("update camera files status - updatedRows: $updatedRows")
  }

  suspend fun updateCameraFilesStatusToNoSyncBelowThisDate(
    cameraFolderDir: String,
    onlyThisMimeTypesList: List<String>,
    belowThisDate: Date
  ) {
    Timber.d("updateCameraFilesStatusToNoSyncBelowThisDate()")
    Timber.d("cameraFolderDir:$cameraFolderDir")
    Timber.d("onlyThisMimeTypesList:$onlyThisMimeTypesList")
    Timber.d("belowThisDate:$belowThisDate")

    val updatedRows = instance.filesDao().updateCameraFilesStatusBelowThisDate(
      cameraFolderDir,
      belowThisDate,
      oldStatus = FileStatus.NEEDS_SYNC,
      newStatus = FileStatus.NO_SYNC,
      onlyThisMimeTypesList,
      Date(),
      Date().toString()
    )
    Timber.d("update camera files status - updatedRows: $updatedRows")
  }
}