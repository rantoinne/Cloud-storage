package com.opacity.androidsdk.db.converters

import androidx.room.TypeConverter
import com.opacity.androidsdk.db.entity.Change
import com.opacity.androidsdk.db.entity.FileStatus
import com.opacity.androidsdk.filesys.ScanStatus
import java.util.*

internal class Converters {
  companion object {

    @JvmStatic
    @TypeConverter
    fun fromDateToLong(date: Date?): Long {
      return date?.time ?: 0
    }

    @JvmStatic
    @TypeConverter
    fun fromLongToDate(dateAsMilli: Long): Date {
      return Date(dateAsMilli)
    }

    @JvmStatic
    @TypeConverter
    fun fromFileStatusToString(fileStatus: FileStatus): String {
      return fileStatus.toString()
    }

    @JvmStatic
    @TypeConverter
    fun fromStringToFileStatus(fileStatus: String): FileStatus {
      return FileStatus.valueOf(fileStatus)
    }

    @JvmStatic
    @TypeConverter
    fun fromChangeToString(change: Change): String {
      return change.toString()
    }

    @JvmStatic
    @TypeConverter
    fun fromStringToChange(change: String): Change {
      return Change.valueOf(change)
    }

    @JvmStatic
    @TypeConverter
    fun fromScanStatusToString(scanStatus: ScanStatus): String {
      return scanStatus.toString()
    }

    @JvmStatic
    @TypeConverter
    fun fromStringToScanStatus(scanStatus: String): ScanStatus {
      return ScanStatus.valueOf(scanStatus)
    }


    @JvmStatic
    @TypeConverter
    fun fromWhitelistedPathsToString(whitelistPaths: List<String>): String {
      var whitelistPathsAsString: StringBuilder = StringBuilder("")
      whitelistPaths.forEach {
        whitelistPathsAsString.append(it)
          .append("|")
      }
      return whitelistPathsAsString.toString()
    }

    @JvmStatic
    @TypeConverter
    fun fromStringToWhitelistedPaths(whitelistPathsAsString: String): List<String> {
      val whitelistPaths = mutableListOf<String>()

      if (whitelistPathsAsString.isNotEmpty()) {
        val valueArr = whitelistPathsAsString.split("|")
        valueArr.forEach { path ->
          if (path.isNotEmpty()) {
            whitelistPaths.add(path)
          }
        }
      }
      return whitelistPaths
    }

  }
}