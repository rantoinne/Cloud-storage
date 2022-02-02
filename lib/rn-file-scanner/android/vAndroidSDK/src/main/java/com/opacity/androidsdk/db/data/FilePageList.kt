package com.opacity.androidsdk.db.data

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

data class FilePageList(
  val data: Array<File>,
  val start: Double,
  val end: Double,
  val page: Double
) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as FilePageList

    if (!data.contentEquals(other.data)) return false

    return true
  }

  override fun hashCode(): Int {
    return data.contentHashCode()
  }

  fun getMap(): WritableMap {

    val filePage = Arguments.createMap()
    filePage.putDouble(START_KEY, start)
    filePage.putDouble(END_KEY, end)
    filePage.putDouble(PAGE_KEY, page)

    //
    val filesArr = Arguments.createArray()
    if (data.isNotEmpty()) {
      fillFilesArray(filesArr)
    }
    filePage.putArray(DATA_KEY, filesArr)

    return filePage
  }

  private fun fillFilesArray(filesArr: WritableArray) {
    for (file in data) {
      filesArr.pushMap(file.getMap())
    }

  }

  companion object {
    private const val DATA_KEY = "data"
    private const val START_KEY = "start"
    private const val END_KEY = "end"
    private const val PAGE_KEY = "page"
    fun dummyFilePageList(page: Double) = FilePageList(arrayOf(), 0.0, 0.0, page)
  }
}


