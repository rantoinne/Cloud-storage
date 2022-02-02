package com.opacity.androidsdk.db.entity

import androidx.annotation.Keep
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.opacity.androidsdk.db.data.Config
import com.opacity.androidsdk.filesys.FileInfo
import timber.log.Timber
import java.util.*

@Entity(tableName = "files_syncing_config")
@Keep //tell proguard to ignore this class
internal data class SyncConfig(
  @PrimaryKey()
  var id: Int = 0,
  @ColumnInfo(name = "include_videos") val includeVideos: Boolean = true,
  @ColumnInfo(name = "include_photos") val includePhotos: Boolean = true,
  @ColumnInfo(name = "sync_photos_from_date") val syncPhotosFromDate: Date? = null,
  @ColumnInfo(name = "whitelist_paths") var whitelistPaths: List<String> = listOf(),
  @ColumnInfo(name = "has_storage_access") val hasStorageAccess: Boolean = true,
  @ColumnInfo(name = "last_update_date") val lastUpdateDate: Date = Date()
) {
  fun getSyncRule(): SyncRules = when {
    (includeVideos && includePhotos) && isSyncOnlyNewPhotos() -> SyncRules.BACK_CAMERA_ALL_VIDEOS_AND_ONLY_NEW_PHOTOS
    includeVideos && includePhotos -> SyncRules.BACK_CAMERA_ALL_VIDEOS_PHOTOS
    includeVideos && !includePhotos -> SyncRules.BACK_CAMERA_VIDEOS_ONLY
    (!includeVideos && includePhotos) && isSyncOnlyNewPhotos() -> SyncRules.BACK_CAMERA_NEW_PHOTOS_ONLY
    !includeVideos && includePhotos -> SyncRules.BACK_CAMERA_PHOTOS_ONLY
    else -> SyncRules.BACKUP_ALL_FILES
  }

  fun isSyncOnlyNewPhotos(): Boolean {
    //we have to check if 'syncPhotosFromDate' has a time value or not
    //if yes then we have to sync only the photos starting from that date
    var isDateFound = false
    syncPhotosFromDate?.let {
      isDateFound = it.time > 0
    }
    return isDateFound
  }

  fun getWhiteListPaths(): MutableList<FileInfo> = mutableListOf<FileInfo>()
    .also { list ->
      if (whitelistPaths.isNotEmpty()) {

        for (path in whitelistPaths) {
          list.add(FileInfo(path))
        }
      }
    }

  fun isWhiteListPathsChanged(syncConfig: SyncConfig) =
    whitelistPaths.hashCode() != syncConfig.whitelistPaths.hashCode()

  companion object {
    fun parse(config: Config): SyncConfig {
      Timber.d("parse()")
      Timber.d("config: $config")
      val syncPhotosFromDateAsLong =
        if (config.syncPhotosFromDate != null) config.syncPhotosFromDate!!.toLong() else 0
      val syncPhotosFromDate = Date(syncPhotosFromDateAsLong)
      Timber.d("syncPhotosFromDateAsLong: $syncPhotosFromDateAsLong")
      Timber.d("syncPhotosFromDate: $syncPhotosFromDate")

      val whitelistPaths = mutableListOf<String>().also { list ->
        if (config.whitelistPaths.isNotEmpty()) {
          config.whitelistPaths.forEach { path ->
            list.add(path)
          }
        }
      }
      Timber.d("whitelistPaths: $whitelistPaths")

      //
      return SyncConfig(
        includeVideos = config.includeVideos,
        includePhotos = config.includePhotos,
        syncPhotosFromDate = syncPhotosFromDate,
        whitelistPaths = whitelistPaths,
        hasStorageAccess = config.hasStorageAccess
      )
    }
  }
}

internal enum class SyncRules {
  BACKUP_ALL_FILES, BACK_CAMERA_ALL_VIDEOS_PHOTOS, BACK_CAMERA_VIDEOS_ONLY, BACK_CAMERA_PHOTOS_ONLY, BACK_CAMERA_NEW_PHOTOS_ONLY, BACK_CAMERA_ALL_VIDEOS_AND_ONLY_NEW_PHOTOS
}
