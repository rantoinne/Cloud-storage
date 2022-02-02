package com.opacity.androidsdk.db.data

import com.facebook.react.bridge.ReadableMap

data class GetFilesOptions(
  var page: Double,
  var dirPath: String,
  var sortBy: String?,
  var searchText: String,
) {

  companion object {

    private const val PAGE_KEY = "page"
    private const val DIR_PATH_KEY = "dirPath"
    private const val SORT_BY_KEY = "sortBy"
    private const val SEARCH_TEXT_KEY = "searchText"

    @JvmStatic
    fun parse(readableMap: ReadableMap): GetFilesOptions? {
      return if (
        readableMap.hasKey(DIR_PATH_KEY) &&
        readableMap.hasKey(SORT_BY_KEY)
      ) {
        GetFilesOptions(
          page = if (readableMap.hasKey(PAGE_KEY)) readableMap.getDouble(PAGE_KEY) else 1.0,
          dirPath = readableMap.getString(DIR_PATH_KEY)!!,
          sortBy = readableMap.getString(SORT_BY_KEY),
          searchText = if (readableMap.hasKey(SEARCH_TEXT_KEY)) readableMap.getString(
            SEARCH_TEXT_KEY
          )!! else "",
        )
      } else {
        null
      }
    }
  }
}
