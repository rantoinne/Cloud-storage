package com.opacity.androidsdk.db.data

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.FileStatus

data class File(
  val status: String,
  val path: String,
  val updatedPath: String?,
  val type: String,
  val size: Double
) {

  fun getMap(): WritableMap {
    val fileMap = Arguments.createMap()
    fileMap.putString(STATUS_KEY, status)
    fileMap.putString(PATH_KEY, path)
    fileMap.putString(TYPE_KEY, type)
    fileMap.putDouble(SIZE_KEY, size)
    if (updatedPath != null) {
      fileMap.putString(UPDATED_PATH_KEY, updatedPath)
    } else {
      fileMap.putNull(UPDATED_PATH_KEY)
    }

    return fileMap
  }


  companion object {

    private const val STATUS_KEY = "status"
    private const val PATH_KEY = "path"
    private const val UPDATED_PATH_KEY = "updatedPath"
    private const val TYPE_KEY = "type"
    private const val SIZE_KEY = "size"


    fun parse(fileRecord: PartialFileRecord): File {
      return File(
        //if file is marked as deleted then return file status as 'deleted'
        if (fileRecord.change == Change.DELETED) FileStatus.getRNFileStatusValue(FileStatus.DELETED) else FileStatus.getRNFileStatusValue(
          fileRecord.status
        ),
        if (fileRecord.lastRNPath.isEmpty()) fileRecord.path else fileRecord.lastRNPath,
        if (fileRecord.lastRNPath.isEmpty() || fileRecord.lastRNPath == fileRecord.path) null else fileRecord.path,
        fileRecord.mimeType,
        fileRecord.size.toDouble()
      )
    }

    fun parse(readableMap: ReadableMap): FileStatusRecord? {
      var filePath: String? = null
      var fileStatusStr: String? = null

      if (readableMap.hasKey(PATH_KEY) && !readableMap.isNull(PATH_KEY)) {
        filePath = readableMap.getString(PATH_KEY)
      }

      if (readableMap.hasKey(STATUS_KEY) && !readableMap.isNull(STATUS_KEY)) {
        fileStatusStr = readableMap.getString(STATUS_KEY)
      }
      return if (filePath != null && fileStatusStr != null && FileStatus.parse(fileStatusStr) != null) {
        return FileStatusRecord(filePath, FileStatus.parse(fileStatusStr)!!)
      } else {
        null
      }
    }

  }
}
