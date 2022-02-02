package com.opacity.androidsdk.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.*
import android.graphics.Color
import android.os.*
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.opacity.androidsdk.R
import com.opacity.androidsdk.db.FilesDatabase
import com.opacity.androidsdk.db.entity.SyncConfig
import com.opacity.androidsdk.filesys.*
import com.opacity.androidsdk.filesys.FileInfo
import com.opacity.androidsdk.filesys.FileSysObserver
import com.opacity.androidsdk.filesys.StorageVolumes
import com.opacity.androidsdk.util.EventsManager
import com.opacity.androidsdk.util.MimeTypes
import com.opacity.androidsdk.util.RNEvent
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collect
import timber.log.Timber
import java.util.*


internal class FilesSyncService : Service() {

  private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
  private val storageVolumes: StorageVolumes = StorageVolumes()
  private var isForegroundService = false

  init {
    Timber.d("FilesSyncService - init - $this")
  }

  override fun onBind(intent: Intent?): IBinder? {
    Timber.d("onBind()")
    return null
  }

  override fun onCreate() {
    super.onCreate()
    Timber.d("onCreate()")

    // FilesDatabase is singleton and can be be initialized only once
    // We already initialized the database instance in FilesSyncSDK before starting this service
    // But we need also to initialize the database instance here,
    // calling FileDatabase.init multiple times won't cost us any resources
    // because if the db is initialized, then all the other calls will be ignored
    // so we have to call FilesDatabase.init(this) one more time here to make sure that db is initialized
    // because if the app has been killed for any reason, then the Android system will recreate this service again,
    // that's why we need to reinitialize db again because the old db instance is gone when the app is completely killed
    FilesDatabase.init(this)
    //
    //activateForegroundService()

    //
    serviceScope.launch(Dispatchers.Main) {
      var start = 0
      while (true) {
        Timber.d("${this@FilesSyncService} - ${start++} - service is running - thread: ${Thread.currentThread().name}")
        delay(10000)// ping every 10 minutes
      }
    }

    //
    serviceScope.launch {
      FilesDatabase.getConfig().collect {
        Timber.d("received config: $it")
        it?.let { config ->
          //
          parseConfig(config)
        }
      }
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Timber.d("onStartCommand()")
    //Important to let system re-create the service if it got killed for system low-resources
    return START_STICKY //
  }

  override fun onUnbind(intent: Intent?): Boolean {
    Timber.d("onUnbind()")
    return super.onUnbind(intent)
  }

  override fun onDestroy() {
    super.onDestroy()
    Timber.d("onDestroy()")
    //IMPORTANT we need to stop the current root scope's running coroutines
    Timber.d("Canceled Service Root Scope")
    serviceScope.cancel()
    FileSysObserver.stopObserving()

  }

  override fun onTaskRemoved(rootIntent: Intent?) {
    super.onTaskRemoved(rootIntent)
    Timber.d("onTaskRemoved()")

  }

  private fun activateForegroundService() {
    Timber.d("activateForegroundService()")
    //
    startForeground()
    isForegroundService = true
  }

  private fun deactivateForegroundService() {
    Timber.d("deactivateForegroundService()")
    //
    stopForeground(true)
    isForegroundService = false
  }

  private fun startForeground() {
    val channelId =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        createNotificationChannel(
          resources.getString(R.string.opacityServiceNotification_channelIDTxt),
          resources.getString(R.string.opacityServiceNotification_channelNameTxt),
        )
      } else {
        // If earlier version channel ID is not used
        ""
      }

    val notificationBuilder = NotificationCompat.Builder(this, channelId)
    val notification = notificationBuilder.setOngoing(true)
      .setContentTitle(resources.getString(R.string.opacityServiceNotification_titleTxt))
      .setContentText(resources.getString(R.string.opacityServiceNotification_contentTxt))
      .setColor(ContextCompat.getColor(this, R.color.opacityServiceNotification_color))
      .setSmallIcon(R.drawable.app_notification_icon)
      //.setPriority(PRIORITY_MIN)
      .setCategory(Notification.CATEGORY_SERVICE)
      .build()
    startForeground(NOTIFICATION_ID, notification)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun createNotificationChannel(channelId: String, channelName: String): String {
    val channel = NotificationChannel(
      channelId,
      channelName, NotificationManager.IMPORTANCE_HIGH
    )
    channel.lightColor = Color.BLUE
    channel.lockscreenVisibility = Notification.VISIBILITY_PRIVATE
    val service = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    service.createNotificationChannel(channel)
    return channelId
  }

  private fun parseConfig(config: SyncConfig) {
    Timber.d("parseConfig()")

    //We need to update the local DB records FileStatus based on the incoming config
    serviceScope.launch(Dispatchers.Main) {

      //
      val primaryStorage = storageVolumes.getPrimaryStorage(this@FilesSyncService)
      //For Testing purposes override original path with a testing fake path
      //primaryStorage.dir = FileInfo(VolumeObserver.testInternalStorageDir)
      //======================
      val cameraDir = primaryStorage.getCameraFolder()
      Timber.d("primaryStorage: $primaryStorage")
      Timber.d("primaryStorage.getCameraFolder(): $cameraDir - cameraDirFileKey: ${cameraDir.fileKey}")

      withContext(Dispatchers.IO) {
        //update the local DB media data based on the incoming config object
        updateLocalDBMediaData(config, cameraDir)
      }

      // if we have no storage access permission (i.e user could deny permissions at any time) then ignore
      if (!config.hasStorageAccess) {
        Timber.d("app doesn't have needed permission access, then stop observing")

        //if the file system observing was running then we have to stop observing
        if (FileSysObserver.isRunning()) {
          Timber.d("stop observing the file system")
          FileSysObserver.stopObserving()
        }
        //notify RN that SDK can't perform scan because 'hasStorageAccess' is false which means that needed permissions not granted
        EventsManager.sendScanStatusRNEvent(RNEvent.SCAN_STATUS_NO_ACCESS)
        //stop making the service as foreground service and remove notification
        if (isForegroundService) {
          deactivateForegroundService()
        }
        return@launch
      }

      //make the service as foreground service and remove notification
      if (!isForegroundService) {
        activateForegroundService()
      }

      if (FileSysObserver.isRunning()) {
        //
        FileSysObserver.updateConfig(config)
      } else {
        //
        FileSysObserver.setConfig(config)
        //add camera folder to the white listed paths
        val whiteListedPaths = config.getWhiteListPaths()
        whiteListedPaths.add(primaryStorage.getCameraFolder())
        //
        FileSysObserver.observeStorageVolume(primaryStorage, whiteListedPaths)
      }
    }
  }

  private suspend fun updateLocalDBMediaData(config: SyncConfig, cameraDir: FileInfo) {
    Timber.d("updateLocalDBMediaData()")

    val videosMimeTypes = MimeTypes.getVideosMimeTypes()
    val imagesMimeTypes = MimeTypes.getImagesMimeTypes()

    //
    if (config.includeVideos) {
      Timber.d("includeVideos -  then mark all no_sync videos to needs_sync")

      FilesDatabase.updateCameraFilesStatusToNeedsSync(
        cameraDir.path,
        videosMimeTypes
      )
    } else {
      Timber.d("not includeVideos -  then mark all needs_sync videos to no_sync")

      FilesDatabase.updateCameraFilesStatusToNoSync(
        cameraDir.path,
        videosMimeTypes
      )
    }

    //
    if (config.includePhotos) {

      if (config.isSyncOnlyNewPhotos()) {
        Timber.d("include OnlyNewPhotos - then mark all photos that needs_sync older than this date to no_sync")
        FilesDatabase.updateCameraFilesStatusToNoSyncBelowThisDate(
          cameraDir.path,
          imagesMimeTypes,
          config.syncPhotosFromDate!!
        )
      } else {
        Timber.d("includePhotos -  then mark all no_sync photos to needs_sync")

        FilesDatabase.updateCameraFilesStatusToNeedsSync(
          cameraDir.path,
          imagesMimeTypes
        )
      }

    } else {
      Timber.d("not includePhotos -  then mark all needs_sync photos to no_sync")
      FilesDatabase.updateCameraFilesStatusToNoSync(
        cameraDir.path,
        imagesMimeTypes
      )
    }
  }

  companion object {
    private const val NOTIFICATION_ID = 101
  }

}