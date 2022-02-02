package com.opacity.androidsdk.db.data

import androidx.room.ColumnInfo

internal data class SubFile(
  val fileKey: String,
  var path: String,
  @ColumnInfo(name = "parent_dir") var parentDir: String,
)
