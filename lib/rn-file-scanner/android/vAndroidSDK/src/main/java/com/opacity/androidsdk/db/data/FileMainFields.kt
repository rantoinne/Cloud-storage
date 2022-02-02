package com.opacity.androidsdk.db.data

import androidx.room.ColumnInfo
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.FileStatus

internal data class FileMainFields(
  val fileKey: String,
  val path: String,
  @ColumnInfo(name = "last_rn_path") val lastRNPath: String,
  @ColumnInfo(name = "parent_dir") val parentDir: String,
  val name: String,
  val size: Long = 0,
  val status: FileStatus = FileStatus.NO_SYNC,
  val change: Change = Change.NONE
)
