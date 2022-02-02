package com.opacity.androidsdk.util

internal object MimeTypes {

  /* Videos MimeTypes based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  * video/x-msvideo
  * video/mp4
  * video/mpeg
  * video/ogg
  * video/mp2t
  * video/webm
  * video/3gpp
  * video/3gpp2
  */
  private val videosMimeTypes: HashSet<String> = hashSetOf(
    "video/x-msvideo",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/mp2t",
    "video/webm",
    "video/3gpp",
    "video/3gpp2",
  )

  /* Images MimeTypes based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  * image/bmp
  * image/gif
  * image/vnd.microsoft.icon
  * image/jpeg
  * image/png
  * image/svg+xml
  * image/tiff
  * image/webp
  * */
  private val imagesMimeTypes: HashSet<String> = hashSetOf(
    "image/bmp",
    "image/gif",
    "image/vnd.microsoft.icon",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
  )

  fun getVideosMimeTypes(): List<String> = mutableListOf<String>().also {
    it.addAll(videosMimeTypes)
  }

  fun getImagesMimeTypes(): List<String> = mutableListOf<String>().also {
    it.addAll(imagesMimeTypes)
  }

  fun getAllVideosImagesMimeTypes(): HashSet<String> = hashSetOf<String>().also {
    it.addAll(videosMimeTypes)
    it.addAll(imagesMimeTypes)
  }

  fun isVideo(mimeType: String): Boolean = videosMimeTypes.contains(mimeType)

  fun isImage(mimeType: String): Boolean = imagesMimeTypes.contains(mimeType)

}

