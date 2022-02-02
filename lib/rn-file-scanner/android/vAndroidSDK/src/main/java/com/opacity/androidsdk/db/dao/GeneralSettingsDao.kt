package com.opacity.androidsdk.db.dao

import androidx.room.*
import com.opacity.androidsdk.db.entity.GeneralSettings
import com.opacity.androidsdk.filesys.ScanStatus
import kotlinx.coroutines.flow.Flow
import java.util.*


@Dao
internal interface GeneralSettingsDao {

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun saveGeneralSettings(generalSettings: GeneralSettings): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun saveInitialGeneralSettings(generalSettings: GeneralSettings): Long

  @Query("DELETE from general_settings")
  suspend fun deleteAllGeneralSettings(): Int

  @Query("Select * from general_settings LIMIT 1")
  suspend fun getGeneralSettings(): GeneralSettings?

  @Query("Select * from general_settings LIMIT 1")
  fun getGeneralSettingsFlowable(): Flow<GeneralSettings?>

  @Query("UPDATE general_settings SET scan_status = :scanStatus, last_update_date = :lastUpdateDate WHERE id = 0")
  suspend fun updateScanStatus(scanStatus: ScanStatus, lastUpdateDate: Date = Date())


}