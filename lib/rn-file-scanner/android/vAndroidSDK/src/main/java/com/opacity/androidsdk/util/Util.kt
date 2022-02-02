package com.opacity.androidsdk.util

import android.os.Build
import android.system.Os
import android.webkit.MimeTypeMap
import timber.log.Timber
import java.io.File
import java.nio.file.Files
import java.nio.file.attribute.BasicFileAttributes
import java.util.*

/*
* Some Utils For OpacityAndroidSDK
* */
internal object Util {


  val File.getCreationDate: Date
    get() {


      //IMPORTANT, getting the file creation date only supported in Android O (API 26) and higher
      return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

        try {
          val attr: BasicFileAttributes = Files.readAttributes(
            toPath(),
            BasicFileAttributes::class.java
          )
          Date(attr.creationTime().toMillis())
        } catch (e: Exception) {
          Date(0)
        }

      } else {
        Date(lastModified())
      }
    }

  /*
  * return fileKey with the following structure
  * (dev=$DEVICE_ID_VALUE,ino=$INODE_VALUE)
  * i.e
  * (dev=7e,ino=1842916)
  * which a unique identifier the file
  * */
  val File.getFileKey: String?
    get() {
      return try {

        //get file stat struct which contain the storageDeviceID and Inode for the file (file or folder)
        val st = Os.stat(path)
        if (st != null) {
          Timber.d("Got FileKey")
          "(dev=${java.lang.Long.toHexString(st.st_dev)},ino=${st.st_ino})"
        } else {
          Timber.d("error - can't get fileKey - st is null - path: $path")
          null
        }
      } catch (e: Exception) {

        Timber.d("error - can't get fileKey - path: $path - e: $e")
        null
      }
    }

  fun getMimeType(url: String?): String? {
    var type: String? = null
    val extension = MimeTypeMap.getFileExtensionFromUrl(url)
    if (extension != null) {
      type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
    }
    return type
  }

  val File.getMimeType: String
    get() {
      return if (extension.isNotEmpty()) {
        MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: ""
      } else
        ""
    }

}