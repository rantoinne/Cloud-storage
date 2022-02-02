package com.opacity.androidsdk.db.dao

import androidx.room.*
import com.opacity.androidsdk.db.data.*
import com.opacity.androidsdk.db.data.FileMainFields
import com.opacity.androidsdk.db.data.SubFile
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.FileRecord
import com.opacity.androidsdk.db.entity.FileStatus
import com.opacity.androidsdk.filesys.FileInfo
import com.opacity.androidsdk.util.EventsManager
import com.opacity.androidsdk.util.RNEvent
import com.opacity.androidsdk.util.Util.getMimeType
import timber.log.Timber
import java.util.*

@Dao
internal abstract class FilesDao {

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  abstract suspend fun addFile(fileRecord: FileRecord): Long

  @Update
  abstract suspend fun updateFile(fileRecord: FileRecord): Int

  @Delete
  abstract suspend fun deleteFile(fileRecord: FileRecord): Int

  @Query("DELETE FROM files_list WHERE change = :changeIsDeleted")
  abstract suspend fun removeAllRecordsMarkedAsDeleted(changeIsDeleted: Change = Change.DELETED): Int

  @Query("SELECT fileKey, path FROM files_list")
  abstract suspend fun getAllFilesKeys(): List<FileKeyRecord>

  @Query("DELETE FROM files_list WHERE fileKey = :fileKey")
  abstract suspend fun deleteByFileKey(fileKey: String): Int

  @Query("DELETE FROM files_list WHERE path = :filePath")
  abstract suspend fun deleteByFilePath(filePath: String)

  @Query("SELECT * FROM files_list WHERE path = :filePath")
  abstract suspend fun getFileByPath(filePath: String): FileRecord?

  @Query("SELECT * FROM files_list WHERE last_rn_path = :lastRNPath")
  abstract suspend fun getFileByLastReactNativePath(lastRNPath: String): FileRecord?

  @Query("SELECT last_rn_path FROM files_list WHERE fileKey = :uniqueKey")
  abstract suspend fun getFileLastReactNativePath(uniqueKey: String): String

  @Query("SELECT fileKey, path, last_rn_path, parent_dir, name, status, size, change FROM files_list WHERE fileKey = :uniqueKey")
  abstract suspend fun getFileByKey(uniqueKey: String): FileMainFields?

  @Query("SELECT fileKey FROM files_list WHERE path = :path AND change != :change")
  abstract suspend fun getFileKeyByPathIfChangeNotEqual(
    path: String,
    change: Change
  ): List<String>

  @Query("SELECT last_rn_path, status FROM files_list WHERE fileKey = :fileUniqueKey")
  abstract suspend fun getCurrentFileStatus(
    fileUniqueKey: String
  ): FileStatusRecord?

  @Query("SELECT fileKey, path, parent_dir FROM files_list WHERE instr(parent_dir, :parentDir)")
  abstract suspend fun getDirChildren(parentDir: String): List<SubFile>

  @Transaction
  @Query("SELECT fileKey FROM files_list WHERE is_dir = 0 AND status = :fileStatus")
  abstract suspend fun getTotalFilesCountByFileStatus(
    fileStatus: FileStatus
  ): List<FileCountRecord>?

  @Transaction
  @Query("SELECT fileKey FROM files_list WHERE is_dir = 0 AND change = :changeIsDeleted")
  abstract suspend fun getTotalFilesCountByFileStatusDeleted(
    changeIsDeleted: Change = Change.DELETED
  ): List<FileCountRecord>?

  @Transaction
  @Query("SELECT fileKey FROM files_list WHERE is_dir = 0")
  abstract suspend fun getTotalFilesCountAllFileStatus(
  ): List<FileCountRecord>?

  @Transaction
  @Query("SELECT fileKey, path, parent_dir, last_rn_path, name, created_date, status, change, size, mimetype FROM files_list WHERE instr(parent_dir, :parentDir) AND instr(lower(name), lower(:searchTxt)) ORDER BY is_dir DESC, name DESC")
  abstract suspend fun getDirChildrenSortByNameAndMatchSearch(
    parentDir: String,
    searchTxt: String
  ): List<PartialFileRecord>

  @Transaction
  @Query("SELECT fileKey, path, parent_dir, last_rn_path, name, created_date, status, change, size, mimetype FROM files_list WHERE instr(parent_dir, :parentDir) AND instr(lower(name), lower(:searchTxt)) ORDER BY mimetype DESC")
  abstract suspend fun getDirChildrenSortByTypeAndMatchSearch(
    parentDir: String,
    searchTxt: String
  ): List<PartialFileRecord>

  @Transaction
  @Query("SELECT fileKey, path, parent_dir, last_rn_path, name, created_date, status, change, size, mimetype FROM files_list WHERE instr(parent_dir, :parentDir) AND instr(lower(name), lower(:searchTxt)) ORDER BY size DESC")
  abstract suspend fun getDirChildrenSortBySizeAndMatchSearch(
    parentDir: String,
    searchTxt: String
  ): List<PartialFileRecord>

  @Transaction
  @Query("SELECT fileKey, path, parent_dir, last_rn_path, name, created_date, status, change, size, mimetype FROM files_list WHERE instr(parent_dir, :parentDir) AND instr(lower(name), lower(:searchTxt)) ORDER BY is_dir DESC, created_date DESC")
  abstract suspend fun getDirChildrenSortByCreateDateAndMatchSearch(
    parentDir: String,
    searchTxt: String
  ): List<PartialFileRecord>

  @Transaction
  @Query("SELECT fileKey, path, parent_dir, last_rn_path, name, created_date, status, change, size, mimetype FROM files_list WHERE instr(parent_dir, :parentDir) AND instr(lower(name), lower(:searchTxt)) ORDER BY is_dir DESC, record_create_date ASC")
  abstract suspend fun getDirChildrenSortByRecordCreateDateAndMatchSearch(
    parentDir: String,
    searchTxt: String
  ): List<PartialFileRecord>

  @Query("UPDATE files_list SET status = :fileStatus, record_last_update_date = :lastUpdateDate WHERE status = :uploadInProgressStatus")
  abstract suspend fun updateAllFileStatusUploadInProgressToNeedsSync(
    uploadInProgressStatus: FileStatus = FileStatus.UPLOAD_IN_PROGRESS,
    fileStatus: FileStatus = FileStatus.NEEDS_SYNC,
    lastUpdateDate: Date = Date()
  ): Int

  @Transaction
  @Query("UPDATE files_list SET path = :path, parent_dir = :parentDir, name = :name, status = :status, record_last_update_date = :lastUpdateDate WHERE sha256_checksum = :fileSHA256Hash")
  abstract suspend fun updateFileByHash(
    fileSHA256Hash: String,
    path: String,
    parentDir: String,
    name: String,
    status: FileStatus,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET path = :path, parent_dir = :parentDir, name = :name, mimetype = :mimeType, size = :size, status = :status, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFileByKey(
    fileUniqueKey: String,
    path: String,
    parentDir: String,
    name: String,
    mimeType: String,
    size: Long,
    status: FileStatus,
    change: Change,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET sha256_checksum = :fileSHA256Hash WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFileHash(
    fileUniqueKey: String,
    fileSHA256Hash: String,
  ): Int

  @Transaction
  @Query("UPDATE files_list SET sha256_checksum = :fileSHA256Hash, size = :fileSize, status = :fileStatus, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey AND sha256_checksum != :fileSHA256Hash")
  abstract suspend fun updateFileHashIfChanged(
    fileUniqueKey: String,
    fileSHA256Hash: String,
    fileSize: Long,
    fileStatus: FileStatus,
    change: Change,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET name = :name, path = :path, mimeType = :mimeType, status = :fileStatus, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFileName(
    fileUniqueKey: String,
    path: String,
    name: String,
    mimeType: String,
    fileStatus: FileStatus,
    change: Change,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET name = :name, path = :path, parent_dir = :parentDir, mimeType = :mimeType, status = :fileStatus, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFilePath(
    fileUniqueKey: String,
    path: String,
    parentDir: String,
    name: String,
    mimeType: String,
    fileStatus: FileStatus,
    change: Change,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET last_rn_path = :lastRNPath, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey AND last_rn_path != :lastRNPath")
  abstract suspend fun updateFileLastRNPath(
    fileUniqueKey: String,
    lastRNPath: String,
    lastUpdateDate: Date
  ): Int

  @Query("UPDATE files_list SET status = :fileStatus, record_last_update_date = :lastUpdateDate WHERE last_rn_path = :lastRNPath")
  abstract suspend fun updateFileStatusByLastRNPath(
    lastRNPath: String,
    fileStatus: FileStatus,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFileChangeStatus(
    fileUniqueKey: String,
    change: Change,
    lastUpdateDate: Date
  ): Int

  @Transaction
  @Query("UPDATE files_list SET change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun markFileAsDeleted(
    fileUniqueKey: String,
    change: Change,
    lastUpdateDate: Date

  ): Int

  @Transaction
  @Query("UPDATE files_list SET change = :change, record_last_update_date = :lastUpdateDate WHERE instr(parent_dir, :parentDir)")
  abstract suspend fun markDirChildrenAsDeleted(
    parentDir: String,
    change: Change,
    lastUpdateDate: Date
  ): Int


  @Query("UPDATE files_list SET path = :path, parent_dir = :parentDir, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateFileParentDir(
    fileUniqueKey: String,
    path: String,
    parentDir: String,
    change: Change,
    lastUpdateDate: Date

  ): Int

  @Query("UPDATE files_list SET path = :path, name = :name, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateDirName(
    fileUniqueKey: String,
    path: String,
    name: String,
    change: Change,
    lastUpdateDate: Date

  ): Int

  @Query("UPDATE files_list SET path = :path, parent_dir = :parentDir, name = :name, change = :change, record_last_update_date = :lastUpdateDate WHERE fileKey = :fileUniqueKey")
  abstract suspend fun updateDirPath(
    fileUniqueKey: String,
    path: String,
    parentDir: String,
    name: String,
    change: Change,
    lastUpdateDate: Date

  ): Int

  @Transaction
  @Query("UPDATE files_list SET parent_dir = :newParentDir, change = :change, record_last_update_date = :lastUpdateDate WHERE parent_dir = :oldParent")
  abstract suspend fun updateFilesParentDir(
    oldParent: String,
    newParentDir: String,
    change: Change,
    lastUpdateDate: Date

  ): Int

  @Transaction
  @Query("UPDATE files_list SET status = :newStatus, record_last_update_date = :lastUpdateDate, record_last_update_date_str = :lastUpdateDateAsStr WHERE parent_dir = :parentDir AND status = :oldStatus AND mimetype IN (:mimeTypesList)")
  abstract suspend fun updateCameraFilesStatus(
    parentDir: String,
    oldStatus: FileStatus,
    newStatus: FileStatus,
    mimeTypesList: List<String>,
    lastUpdateDate: Date,
    lastUpdateDateAsStr: String
  ): Int

  @Transaction
  @Query("UPDATE files_list SET status = :newStatus, record_last_update_date = :lastUpdateDate, record_last_update_date_str = :lastUpdateDateAsStr WHERE parent_dir = :parentDir AND status = :oldStatus AND created_date <= :creationDateBelow AND mimetype IN (:mimeTypesList)")
  abstract suspend fun updateCameraFilesStatusBelowThisDate(
    parentDir: String,
    creationDateBelow: Date,
    oldStatus: FileStatus,
    newStatus: FileStatus,
    mimeTypesList: List<String>,
    lastUpdateDate: Date,
    lastUpdateDateAsStr: String
  ): Int

  @Query("SELECT * FROM files_list WHERE parent_dir = :dir ")
  abstract suspend fun getAllDirFiles(dir: String): List<FileRecord>

  @Query("SELECT * FROM files_list")
  abstract suspend fun getAll(): List<FileRecord>

  @Transaction
  open suspend fun updateFilesLastRNPath(filesList: MutableList<PartialFileRecord>) {
    Timber.d("updateFilesLastRNPath()")
    Timber.d("filesList.size: ${filesList.size}")

    for (fileInfo in filesList) {
      //update file
      val updatedRow = updateFileLastRNPath(
        fileInfo.fileKey,
        fileInfo.path,
        Date()
      )
      Timber.d("fileInfo.path: ${fileInfo.path} - updatedRow: $updatedRow")
    }
    Timber.d("Finished updating files last react native path")
  }

  @Transaction
  open suspend fun updateFilesStatusByLastRNPath(filesList: MutableList<FileStatusRecord>) {
    Timber.d("updateFilesStatusByLastRNPath()")
    Timber.d("filesList.size: ${filesList.size}")

    for (file in filesList) {
      //update file
      val updatedRow = updateFileStatusByLastRNPath(
        file.lastRNPath,
        file.status,
        Date()
      )
      Timber.d("updatedRow: $updatedRow")
    }
    Timber.d("Finished updating files status using last react native path")
  }

  @Transaction
  open suspend fun updateFilesHash(filesList: MutableList<FileInfo>) {
    Timber.d("updateFilesHash()")
    Timber.d("filesList.size: ${filesList.size}")

    for (fileInfo in filesList) {
      //update file
      val updatedRow = updateFileHashIfChanged(
        fileInfo.fileKey,
        fileInfo.sha256Hash,
        fileInfo.length(),
        FileRecord.getFileStatus(fileInfo),
        fileInfo.change,
        Date()
      )
      Timber.d("fileInfo.path: ${fileInfo.path} - updatedRow: $updatedRow")
    }
    Timber.d("Finished updating files hash")
  }

  @Transaction
  open suspend fun addFilesOrUpdateIfExists(filesList: MutableList<FileInfo>) {
    Timber.d("addFilesOrUpdateIfExists()")
    Timber.d("filesList.size: ${filesList.size}")

    for (fileInfo in filesList) {
      //
      addFileOrUpdateIFExists(fileInfo)
    }
    Timber.d("Finished files updating")
  }

  open suspend fun addFileOrUpdateIFExists(fileInfo: FileInfo) {
    Timber.d("addFileOrUpdateIFExists()")
    val fileRow = getFileByKey(fileInfo.fileKey)
    Timber.d("fileRecord: $fileRow")

    if (fileRow == null) {
      //insert file record in the db
      val fileRecord = FileRecord.build(fileInfo)
      val row = addFile(fileRecord)
      //
      Timber.d("Added in db - row: $row - fileRecord: $fileRecord")

      //notify RN that a new file is created
      EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_NEW_FILE)
    } else {

      var change: Change = Change.NONE
      if (!fileRow.path.equals(fileInfo.path) || !fileRow.parentDir.equals(fileInfo.parent)) {
        change = Change.MOVED
      }
      //
      if (!fileRow.name.equals(fileInfo.name)) {
        change = Change.RENAMED
      }
      //check if file size has been changed or not
      if (!fileInfo.isDirectory && !fileRow.size.equals(fileInfo.length())) {
        change = Change.MODIFIED
      }
      Timber.d("change: $change")
      //if name or path or parentDir or size changed then update in db
      if (change != Change.NONE) {
        //get the file Status of the file based on its mimeType and SyncConfig
        val fileStatus =
          if (fileInfo.isDirectory) FileStatus.NEEDS_SYNC else FileRecord.getFileStatus(
            fileInfo
          )
        val fileSize = fileInfo.length()
        Timber.d("new fields - name: ${fileInfo.name} -  status: $fileStatus - parent: ${fileInfo.parent} - file.path: ${fileInfo.path}")

        //
        val updatedRow = updateFileByKey(
          fileInfo.fileKey,
          fileInfo.path,
          fileInfo.parent,
          fileInfo.name,
          fileInfo.getMimeType,
          fileSize,
          fileStatus,
          change,
          Date()
        )
        Timber.d("update file in db - updatedRow: $updatedRow")

        if (change == Change.MODIFIED) {
          //notify RN that a file is modified
           val lastRNPath =  if (fileRow.lastRNPath.isEmpty()) fileInfo.path else fileRow.lastRNPath
          EventsManager.sendFileChangeRNEvent(lastRNPath, fileSize)
        }

      } else {
        //important, if the file became exists and it last change was DELETED,
        // this could mean several cases,
        // # a.e user has deleted the file (partial delete - moved to trash) then restored it
        // # a.e user has moved file out side the observed folder (the whitelist path) then moved it back to the folder (restore)
        // in these cases we need to update the file's change value to remove "DELETED"
        if (fileRow.change == Change.DELETED) {
          val updateRow = updateFileChangeStatus(fileInfo.fileKey, Change.CREATED, Date())
          Timber.d("Change file status from DELETED to CREATED because file has been restored! - updateRow: $updateRow")

          //notify RN that a file is modified
          val lastRNPath =  if (fileRow.lastRNPath.isEmpty()) fileInfo.path else fileRow.lastRNPath
          EventsManager.sendFileChangeRNEvent(lastRNPath, fileInfo.length())
        } else {
          Timber.d("fileKey: ${fileInfo.fileKey} - file is up to date, ignore!")
        }
      }

    }
  }


  @Transaction
  open suspend fun updateDirNameAndItsSubFiles(oldDir: FileInfo, newDir: FileInfo) {
    Timber.d("updateDirNameAndItsSubFiles()")

    val rowID = updateDirName(newDir.fileKey, newDir.path, newDir.name, Change.RENAMED, Date())
    Timber.d("updated dir name - rowID: $rowID")

    //fetch all sub files/dirs for this directory
    val dirSubFiles = getDirChildren(oldDir.path)
    Timber.d("dirSubFiles.size: ${dirSubFiles.size} - dirSubFiles: $dirSubFiles")

    for (file in dirSubFiles) {
      file.parentDir = file.parentDir.replace(oldDir.path, newDir.path)
      file.path = file.path.replace(oldDir.path, newDir.path)
    }
    Timber.d("changed paths -dirSubFiles: $dirSubFiles")

    for (file in dirSubFiles) {
      val childRowID =
        updateFileParentDir(file.fileKey, file.path, file.parentDir, Change.MOVED, Date())
      Timber.d("updated sub file parentDir - rowID: $childRowID")
    }

    Timber.d("updated dir sub file/folder parent dir")

  }

  @Transaction
  open suspend fun updateDirPathAndItsSubFiles(oldDir: FileInfo, newDir: FileInfo) {
    Timber.d("updateDirPathAndItsSubFiles()")
    Timber.d("newDir.parent: ${newDir.parent}")
    val rowID = updateDirPath(
      newDir.fileKey,
      newDir.path,
      newDir.parent,
      newDir.name,
      Change.MOVED,
      Date()
    )
    Timber.d("updated dir path - rowID: $rowID")

    //fetch all sub files/dirs for this directory

    val dirSubFiles = getDirChildren(oldDir.path)
    Timber.d("dirSubFiles.size: ${dirSubFiles.size} - dirSubFiles: $dirSubFiles")

    for (file in dirSubFiles) {
      file.parentDir = file.parentDir.replace(oldDir.path, newDir.path)
      file.path = file.path.replace(oldDir.path, newDir.path)
    }
    Timber.d("changed paths -dirSubFiles: $dirSubFiles")

    for (file in dirSubFiles) {
      val childRowID =
        updateFileParentDir(file.fileKey, file.path, file.parentDir, Change.MOVED, Date())
      Timber.d("updated sub file parentDir - rowID: $childRowID")
    }

    Timber.d("updated dir sub file/folder parent dir")

  }
}
