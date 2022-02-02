package com.opacity.androidsdk.db.data

import androidx.room.ColumnInfo
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.FileStatus
import java.util.*

data class PartialFileRecord(
  var fileKey: String = "",
  val path: String,
  @ColumnInfo(name = "parent_dir") val parentDir: String,
  @ColumnInfo(name = "last_rn_path") val lastRNPath: String = "",
  @ColumnInfo(name = "name") val name: String,
  @ColumnInfo(name = "created_date") val createdDate: Date,
  @ColumnInfo(name = "status") val status: FileStatus = FileStatus.NO_SYNC,
  @ColumnInfo(name = "change") val change: Change = Change.NONE,
  @ColumnInfo(name = "size") val size: Long = 0,
  @ColumnInfo(name = "mimetype") val mimeType: String,
)
