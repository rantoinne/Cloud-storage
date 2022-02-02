package com.opacity.androidsdk.db.entity

import android.webkit.MimeTypeMap
import androidx.annotation.Keep
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.opacity.androidsdk.db.FilesDatabase
import com.opacity.androidsdk.filesys.FileInfo
import com.opacity.androidsdk.filesys.FileSysObserver
import com.opacity.androidsdk.util.EventsManager
import com.opacity.androidsdk.util.MimeTypes
import com.opacity.androidsdk.util.Util.getCreationDate
import com.opacity.androidsdk.util.Util.getMimeType
import timber.log.Timber
import java.util.*

@Entity(tableName = "files_list")
@Keep //tell proguard to ignore this class
internal data class FileRecord(
  // Unique identifier for file using unix system inode + deviceId (storage volume id)
  // with the following structure
  // (dev=$DEVICE_ID_VALUE,ino=$INODE_VALUE)
  // i.e
  // (dev=7e,ino=1859620)
  @PrimaryKey
  var fileKey: String = "",
  val path: String,
  @ColumnInfo(name = "created_date") val createdDate: Date, // save the file/folder creation date
  @ColumnInfo(name = "parent_dir") val parentDir: String, // save the file/folder parent directory
  @ColumnInfo(name = "is_dir") val isDir: Boolean, // true if it's a directory (folder) and false if file
  @ColumnInfo(name = "name") val name: String, // save file name (e.g image1.png)
  @ColumnInfo(name = "mimetype") val mimeType: String, // save the file mimetype (e.g image/png)
  @ColumnInfo(name = "sha256_checksum") val sha256Checksum: String, // save the file mimetype (e.g image/png)
  @ColumnInfo(name = "status") val status: FileStatus = FileStatus.NO_SYNC, //save the FileStatus
  @ColumnInfo(name = "size") val size: Long = 0, // save the file size in bytes
  @ColumnInfo(name = "change") val change: Change = Change.CREATED, // save the last change detected
  @ColumnInfo(name = "last_rn_path") val lastRNPath: String = "", // save the last change detected
  @ColumnInfo(name = "record_create_date") val recordCreateDate: Date = Date(),// save timestamp when this db record created
  @ColumnInfo(name = "record_last_update_date") val recordLastUpdateDate: Date = Date(), // save timestamp when this db record updated
  @ColumnInfo(name = "record_last_update_date_str") val recordLastUpdateDateAsStr: String = ""
) {
  companion object {
    suspend fun build(fileInfo: FileInfo): FileRecord {

      val mimeType =
        MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileInfo.extension) ?: ""
      val isDir = fileInfo.isDirectory
      val fileSize = if (isDir) 0 else fileInfo.length()
      val fileStatus = if (isDir) FileStatus.NEEDS_SYNC else getFileStatus(fileInfo)
      return FileRecord(
        fileInfo.fileKey,
        fileInfo.path,
        fileInfo.getCreationDate,
        fileInfo.parent,
        fileInfo.isDirectory,
        fileInfo.name,
        mimeType,
        fileInfo.sha256Hash,
        fileStatus,
        fileSize, //if directory set size to 0
      )
    }

    suspend fun getFileStatus(fileInfo: FileInfo): FileStatus {
      //
      //val lastFileStatusRecord = FilesDatabase.getCurrentFileStatus(fileInfo)

      //we have to check the sync rules and file type to determine the file Status value
      val currentStatus = when (FileSysObserver.syncConfig.getSyncRule()) {
        SyncRules.BACKUP_ALL_FILES -> {
          FileStatus.NEEDS_SYNC
        }
        SyncRules.BACK_CAMERA_ALL_VIDEOS_PHOTOS -> if (MimeTypes.isVideo(fileInfo.getMimeType) || MimeTypes.isImage(
            fileInfo.getMimeType
          )
        ) FileStatus.NEEDS_SYNC else FileStatus.NO_SYNC
        SyncRules.BACK_CAMERA_VIDEOS_ONLY -> if (MimeTypes.isVideo(fileInfo.getMimeType)) FileStatus.NEEDS_SYNC else FileStatus.NO_SYNC
        SyncRules.BACK_CAMERA_PHOTOS_ONLY -> if (MimeTypes.isImage(fileInfo.getMimeType)) FileStatus.NEEDS_SYNC else FileStatus.NO_SYNC
        SyncRules.BACK_CAMERA_NEW_PHOTOS_ONLY -> if (MimeTypes.isImage(fileInfo.getMimeType) && isFileDateExceedStartDate(
            fileInfo
          )
        ) FileStatus.NEEDS_SYNC else FileStatus.NO_SYNC
        SyncRules.BACK_CAMERA_ALL_VIDEOS_AND_ONLY_NEW_PHOTOS -> if (MimeTypes.isVideo(
            fileInfo.getMimeType
          ) || (MimeTypes.isImage(fileInfo.getMimeType) && isFileDateExceedStartDate(
            fileInfo
          ))
        ) FileStatus.NEEDS_SYNC else FileStatus.NO_SYNC

      }

//      Timber.d("lastFileStatusRecord: $lastFileStatusRecord")
//      lastFileStatusRecord?.let {
//        if (lastFileStatusRecord.status == FileStatus.UPLOAD_IN_PROGRESS && currentStatus == FileStatus.NEEDS_SYNC) {
//          Timber.d("file last status is UPLOAD_IN_PROGRESS then notify RN to re-upload")
//          EventsManager.sendFileChangeRNEvent(lastFileStatusRecord.lastRNPath)
//        }
//      }

      //
      Timber.d("getFileStatus - fileStatus: $currentStatus")
      return currentStatus
    }

    private fun isFileDateExceedStartDate(fileInfo: FileInfo): Boolean {
      Timber.d("isFileDateExceedStartDate()")
      Timber.d("file.name: ${fileInfo.name}")
      Timber.d("file.date: ${fileInfo.getCreationDate}")
      Timber.d("file.syncPhotosFromDate: ${FileSysObserver.syncConfig.syncPhotosFromDate}")
      var isExceed = true

      FileSysObserver.syncConfig.syncPhotosFromDate?.let {
        isExceed = fileInfo.getCreationDate.time >= it.time
      }

      Timber.d("isExceed: $isExceed")
      return isExceed

    }
  }
}

@Keep //tell proguard to ignore this class
enum class FileStatus {
  NO_SYNC, NEEDS_SYNC, SYNCED, UPLOAD_IN_PROGRESS, UPLOAD_FAILED, DELETED;

  companion object {
    private const val RN_FILE_STATUS_NO_SYNCED = "no-sync"
    private const val RN_FILE_STATUS_NEEDS_SYNCED = "needs-sync"
    private const val RN_FILE_STATUS_SYNCED = "synced"
    private const val RN_FILE_STATUS_UPLOAD_IN_PROGRESS = "upload-in-progress"
    private const val RN_FILE_STATUS_UPLOAD_FAILED = "upload-failed"
    private const val RN_FILE_STATUS_DELETED = "deleted"

    fun parse(RNFileStatus: String?): FileStatus? = when (RNFileStatus) {
      RN_FILE_STATUS_NO_SYNCED -> NO_SYNC
      RN_FILE_STATUS_NEEDS_SYNCED -> NEEDS_SYNC
      RN_FILE_STATUS_SYNCED -> SYNCED
      RN_FILE_STATUS_UPLOAD_IN_PROGRESS -> UPLOAD_IN_PROGRESS
      RN_FILE_STATUS_UPLOAD_FAILED -> UPLOAD_FAILED
      RN_FILE_STATUS_DELETED -> DELETED
      else -> null
    }

    fun getRNFileStatusValue(fileStatus: FileStatus): String = when (fileStatus) {
      NO_SYNC -> RN_FILE_STATUS_NO_SYNCED
      NEEDS_SYNC -> RN_FILE_STATUS_NEEDS_SYNCED
      SYNCED -> RN_FILE_STATUS_SYNCED
      UPLOAD_IN_PROGRESS -> RN_FILE_STATUS_UPLOAD_IN_PROGRESS
      UPLOAD_FAILED -> RN_FILE_STATUS_UPLOAD_FAILED
      DELETED -> RN_FILE_STATUS_DELETED
    }
  }
}

@Keep //tell proguard to ignore this class
enum class Change {
  NONE, CREATED, MODIFIED, DELETED, MOVED, RENAMED
}

@Keep //tell proguard to ignore this class
enum class SortBy {
  NAME, TYPE, SIZE, DATE_CREATED;

  companion object {
    private const val RN_SORT_BY_NAME = "name"
    private const val RN_SORT_BY_TYPE = "type"
    private const val RN_SORT_BY_SIZE = "size"
    private const val RN_SORT_BY_DATE_CREATED = "date-created"

    fun parse(RNSortBy: String?): SortBy? = when (RNSortBy) {
      RN_SORT_BY_NAME -> NAME
      RN_SORT_BY_TYPE -> TYPE
      RN_SORT_BY_SIZE -> SIZE
      RN_SORT_BY_DATE_CREATED -> DATE_CREATED
      else -> null
    }
  }
}
