package com.opacity.androidsdk.db.data

import com.facebook.react.bridge.ReadableMap

data class Config(
  var includeVideos: Boolean,
  var includePhotos: Boolean,
  var syncPhotosFromDate: Double?,
  var whitelistPaths: Array<String>,
  var hasStorageAccess: Boolean,
) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as Config

    if (includeVideos != other.includeVideos) return false
    if (includePhotos != other.includePhotos) return false
    if (syncPhotosFromDate != other.syncPhotosFromDate) return false
    if (!whitelistPaths.contentEquals(other.whitelistPaths)) return false
    if (hasStorageAccess != other.hasStorageAccess) return false

    return true
  }

  override fun hashCode(): Int {
    var result = includeVideos.hashCode()
    result = 31 * result + includePhotos.hashCode()
    result = 31 * result + (syncPhotosFromDate?.hashCode() ?: 0)
    result = 31 * result + whitelistPaths.contentHashCode()
    result = 31 * result + hasStorageAccess.hashCode()
    return result
  }

  companion object {

    private const val INCLUDE_VIDEOS_KEY = "includeVideos"
    private const val INCLUDE_PHOTOS_KEY = "includePhotos"
    private const val SYNC_PHOTOS_FROM_DATE_KEY = "syncPhotosFromDate"
    private const val WHITE_LIST_PATHS_KEY = "whitelistPaths"
    private const val HAS_STORAGE_ACCESS_KEY = "hasStorageAccess"

    @JvmStatic
    fun parse(readableMap: ReadableMap): Config {

      val syncPhotosFromDate = if (readableMap.hasKey(SYNC_PHOTOS_FROM_DATE_KEY)) {
        if (readableMap.isNull(SYNC_PHOTOS_FROM_DATE_KEY)) null else readableMap.getDouble(
          SYNC_PHOTOS_FROM_DATE_KEY
        )
      } else null

      val whitelistPaths = mutableListOf<String>().also { list ->
        if (readableMap.hasKey(WHITE_LIST_PATHS_KEY)) {
          val pathsArr = readableMap.getArray(WHITE_LIST_PATHS_KEY)
          if (pathsArr != null) {
            if (pathsArr.size() > 0) {
              for (i in 0 until pathsArr.size()) {
                list.add(pathsArr.getString(i))
              }
            }
          }
        }
      }
      return Config(
        includeVideos = readableMap.getBoolean(INCLUDE_VIDEOS_KEY),
        includePhotos = readableMap.getBoolean(INCLUDE_PHOTOS_KEY),
        syncPhotosFromDate = syncPhotosFromDate,
        whitelistPaths = whitelistPaths.toTypedArray(),
        hasStorageAccess = readableMap.getBoolean(HAS_STORAGE_ACCESS_KEY)
      )
    }
  }
}
