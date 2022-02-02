package com.opacity.androidsdk.db.dao

import androidx.room.*
import com.opacity.androidsdk.db.entity.SyncConfig
import kotlinx.coroutines.flow.Flow


@Dao
internal interface ConfigDao {

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun saveConfig(syncConfig: SyncConfig): Long

  @Delete
  suspend fun deleteConfig(syncConfig: SyncConfig): Int

  @Query("DELETE from files_syncing_config")
  suspend fun deleteAllConfig(): Int

  @Query("Select * from files_syncing_config LIMIT 1")
  suspend fun getConfig(): SyncConfig

  @Query("Select * from files_syncing_config LIMIT 1")
  fun getConfigFlowable(): Flow<SyncConfig>

  @Query("Select * from files_syncing_config")
  fun getAllConfigFlowable(): Flow<List<SyncConfig>>

}