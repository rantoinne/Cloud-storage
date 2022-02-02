package com.opacity.androidsdk.filesys

import android.system.Os
import com.opacity.androidsdk.db.entity.Change
import timber.log.Timber
import java.io.File

internal class FileInfo(
  path: String,
  var sha256Hash: String = "",
  var change: Change = Change.CREATED,

  ) : File(path) {
  var fileKey: String = getTheFileKey(path)

  private val getIsDirectory: Boolean = extension.isEmpty()
  private val getPath: String =
    if (isDirectory && super.getPath().isNotEmpty()) "${super.getPath()}/" else super.getPath()

  constructor(file: File) : this(file.path)


  /*
 * IMPORTANT, we have to override "path"
 * because "path" return a.e "/storage/emulated/0/new folder"
 * but after override it will return "/storage/emulated/0/new folder/" with extra slash at the end
 * the first value returned from "path"
 * could cause matching issue if there is another dir that partially matched
 * i.e if we need to get all sub-files of dir "/storage/emulated/0/new folder"
 * then contains or instr could match files in another folder with partial match
 * like ""/storage/emulated/0/new folder 1"
 * but when we use the value returned from overridden fun this won't happen because of the extra slash at the end
 * */
  override fun getPath(): String {
    //Timber.d("getPath() - getIsDirectory: $getIsDirectory - value: $getPath")
    return getPath
  }

  override fun getParent(): String {
    return "${super.getParent()}/"
  }

  override fun listFiles(): Array<FileInfo>? {
    val filesList = super.listFiles() ?: return null
    return Array(filesList.size) {
      FileInfo(filesList[it])
    }
  }

  override fun isDirectory(): Boolean {
    return getIsDirectory
  }

  override fun toString(): String {
    return getPath
  }

  private fun getTheFileKey(path: String): String {

    return try {

      //get file stat struct which contain the storageDeviceID and Inode for the file (file or folder)
      val st = Os.stat(path)
      if (st != null) {
        "(dev=${java.lang.Long.toHexString(st.st_dev)},ino=${st.st_ino})"
      } else {
        Timber.d("error - can't get fileKey - st is null - path: $path")
        ""
      }
    } catch (e: Exception) {

      Timber.d("getTheFileKey - error - can't get fileKey - path: $path")
      Timber.e("getTheFileKey - error - can't get fileKey -  e: $e - path: $path")
      ""
    }
  }

  fun isHiddenFile(): Boolean {
    return getPath.contains("/.")
  }

  fun isWhiteListed(whiteListedPaths: List<FileInfo>): Boolean =
    isListContainsPath(whiteListedPaths, getPath) || isListContainsPath(whiteListedPaths, parent)

  companion object {
    fun isListContainsPath(list: List<FileInfo>, path: String): Boolean {
      for (file in list) {
        if (file.path == path) return true
      }
      return false
    }
  }
}
