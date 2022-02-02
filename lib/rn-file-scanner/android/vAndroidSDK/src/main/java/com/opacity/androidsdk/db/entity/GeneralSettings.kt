package com.opacity.androidsdk.db.entity

import androidx.annotation.Keep
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.opacity.androidsdk.filesys.ScanStatus
import java.util.*

@Entity(tableName = "general_settings")
@Keep //tell proguard to ignore this class
internal data class GeneralSettings(
  @PrimaryKey()
  var id: Int = 0,
  @ColumnInfo(name = "scan_status") val scanStatus: ScanStatus = ScanStatus.NO_SCAN,
  @ColumnInfo(name = "last_update_date") val lastUpdateDate: Date = Date()
)