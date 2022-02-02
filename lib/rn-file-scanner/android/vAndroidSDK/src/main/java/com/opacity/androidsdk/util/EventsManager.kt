package com.opacity.androidsdk.util

import android.content.Intent
import com.opacity.androidsdk.FilesSyncSDK
import timber.log.Timber

internal object EventsManager {
  const val ACTION_SCAN_STATUS = "com.opacity.androidsdk.scan.status"
  const val ACTION_SCAN_STATUS_EXTRA = "status"
  const val ACTION_FILE_CHANGED = "com.opacity.androidsdk.file.changed"
  const val ACTION_FILE_CHANGED_FILE_PATH_EXTRA = "path"
  const val ACTION_FILE_CHANGED_FILE_SIZE_EXTRA = "size"

  private val lock = Any()
  private var lastEvent: RNEvent? = null

  fun sendScanStatusRNEvent(rnEvent: RNEvent) {
    Timber.d("sendFileScanRNEvent()")
    Timber.d("rnEvent: $rnEvent")
    //
    send(rnEvent, rnEvent.buildIntent())
    //
    Timber.d("sent ACTION_SCAN_STATUS successfully")

  }

  fun sendFileChangeRNEvent(filePath: String, fileSize: Long) {
    Timber.d("sendFileChangeRNEvent()")
    Timber.d("filePath: $filePath")
    Timber.d("fileSize: $fileSize")
    //
    val fileChangeEvent = RNEvent.FILE_CHANGE
    val intent = fileChangeEvent.buildIntent()
    intent.putExtra(ACTION_FILE_CHANGED_FILE_PATH_EXTRA, filePath)
    intent.putExtra(ACTION_FILE_CHANGED_FILE_SIZE_EXTRA, fileSize)
    //
    send(fileChangeEvent, intent)
    //
    Timber.d("sent ACTION_FILE_CHANGED successfully")

  }

  private fun send(rnEvent: RNEvent, intent: Intent) {
    //Important to lock to prevent race condition specially that this method could be called from different threads
    synchronized(lock) {
      //
      lastEvent?.let { it ->
        if (it == RNEvent.SCAN_STATUS_RUNNING &&
          (rnEvent == RNEvent.SCAN_STATUS_NEW_FILE || rnEvent == RNEvent.FILE_CHANGE)
        ) {
          Timber.d("ignore sending NEW_FILE or FILE_CHANGE events if there is a scan already running!")
          return
        }
      }
      //
      FilesSyncSDK.instance.contextWeakReference?.let { ref ->
        ref.get()?.let { context ->
          context.sendBroadcast(intent)
          lastEvent = rnEvent
        }
      }
    }
  }
}

internal enum class RNEvent {
  SCAN_STATUS_NO_ACCESS {
    override fun valueMatchRN(): String {
      return "NO_ACCESS"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_SCAN_STATUS
        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
      }
    }
  },
  SCAN_STATUS_NO_SCAN {
    override fun valueMatchRN(): String {
      return "NO_SCAN"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_SCAN_STATUS
        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
      }
    }
  },
  SCAN_STATUS_RUNNING {
    override fun valueMatchRN(): String {
      return "RUNNING"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_SCAN_STATUS
        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
      }
    }
  },
  SCAN_STATUS_FINISHED {
    override fun valueMatchRN(): String {
      return "FINISHED"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_SCAN_STATUS
        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
      }
    }
  },
  SCAN_STATUS_NEW_FILE {
    override fun valueMatchRN(): String {
      return "NEW_FILE"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_SCAN_STATUS
        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
      }
    }
  },
//  SCAN_STATUS_FILE_MODIFIED {
//    override fun valueMatchRN(): String {
//      return "FILE_MODIFIED"
//    }
//
//    override fun buildIntent(): Intent {
//      return Intent().also { intent ->
//        intent.action = EventsManager.ACTION_SCAN_STATUS
//        intent.putExtra(EventsManager.ACTION_SCAN_STATUS_EXTRA, valueMatchRN())
//      }
//    }
//  },
  FILE_CHANGE {
    override fun valueMatchRN(): String {
      return "FILE_CHANGE"
    }

    override fun buildIntent(): Intent {
      return Intent().also { intent ->
        intent.action = EventsManager.ACTION_FILE_CHANGED
      }
    }
  };

  abstract fun valueMatchRN(): String
  abstract fun buildIntent(): Intent
}