package com.opacity.androidsdk.db.data

import androidx.room.ColumnInfo
import com.opacity.androidsdk.db.entity.FileStatus


data class FileStatusRecord(
  @ColumnInfo(name = "last_rn_path") val lastRNPath: String,
  @ColumnInfo(name = "status") var status: FileStatus,
)