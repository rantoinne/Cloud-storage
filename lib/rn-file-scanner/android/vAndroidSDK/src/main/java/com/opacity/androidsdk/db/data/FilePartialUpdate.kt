package com.opacity.androidsdk.db.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

@Entity
internal data class FilePartialUpdate(
  @PrimaryKey val path: String,
  @ColumnInfo(name = "parent_dir") val parentDir: String,
  @ColumnInfo(name = "name") val name: String,
  @ColumnInfo(name = "last_update_date") val lastUpdateDate: Date,
)