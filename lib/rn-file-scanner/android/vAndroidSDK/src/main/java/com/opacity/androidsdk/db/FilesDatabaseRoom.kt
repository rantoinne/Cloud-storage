package com.opacity.androidsdk.db

import androidx.room.*
import com.opacity.androidsdk.db.converters.Converters
import com.opacity.androidsdk.db.dao.FilesDao
import com.opacity.androidsdk.db.dao.ConfigDao
import com.opacity.androidsdk.db.dao.GeneralSettingsDao
import com.opacity.androidsdk.db.entity.FileRecord
import com.opacity.androidsdk.db.entity.GeneralSettings
import com.opacity.androidsdk.db.entity.SyncConfig

@Database(entities = [FileRecord::class, SyncConfig::class, GeneralSettings::class], version = 1)
@TypeConverters(Converters::class)
internal abstract class FilesDatabaseRoom : RoomDatabase() {
  abstract fun filesDao(): FilesDao
  abstract fun configDao(): ConfigDao
  abstract fun generalSettingsDao(): GeneralSettingsDao
}