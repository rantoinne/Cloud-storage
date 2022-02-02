package com.opacity.androidsdk.filesys

import android.content.Context
import android.os.Build
import android.os.storage.StorageManager
import android.os.storage.StorageVolume
import androidx.annotation.RequiresApi
import timber.log.Timber

internal class StorageVolumes() {

  private var primaryStorage: FileSystemStorageVolume? = null

  fun getPrimaryStorage(context: Context): FileSystemStorageVolume {
    Timber.d("getPrimaryStorage()")
    val primaryStoragePath = findPrimaryStorage(context)
    primaryStorage = FileSystemStorageVolume(
      FileInfo(primaryStoragePath),
      name = "PrimaryStorage",
      isPrimary = true
    )
    return primaryStorage!!
  }

  private fun findPrimaryStorage(context: Context): String {
    Timber.d("findPrimaryStorage()")
    Timber.d("currentAPI: ${Build.VERSION.SDK_INT}")

    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      //
      val storageManager = context.getSystemService(StorageManager::class.java)
      val storageVolumes: List<StorageVolume> = storageManager.storageVolumes
      val primaryStorage = getPrimaryStorageVolume(storageVolumes)
      primaryStorage?.directory?.path!!

    } else {
      context.externalCacheDir?.path?.substringBefore("/Android/") ?: ""
    }

  }

  @RequiresApi(Build.VERSION_CODES.N)
  private fun getPrimaryStorageVolume(volumes: List<StorageVolume>): StorageVolume? {
    for (volume in volumes) {
      if (volume.isPrimary) return volume
    }
    return null
  }

}

internal data class FileSystemStorageVolume(
  var dir: FileInfo,
  val name: String = "",
  val isPrimary: Boolean = false
) {

  fun getCameraFolder(): FileInfo {
    return FileInfo("${dir.path}$CAMERA_FOLDER_DEFAULT_NAME")
  }

  companion object {
    private const val CAMERA_FOLDER_DEFAULT_NAME: String = "DCIM/Camera"

  }
}
