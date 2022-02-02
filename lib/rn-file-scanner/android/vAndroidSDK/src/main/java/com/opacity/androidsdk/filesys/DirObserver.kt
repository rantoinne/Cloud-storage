package com.opacity.androidsdk.filesys

import android.os.Build
import android.os.FileObserver
import android.os.FileObserver.*
import androidx.annotation.RequiresApi
import kotlinx.coroutines.Job
import timber.log.Timber
import java.util.*


internal class DirObserver(
  private val dir: FileInfo,
  private val onFileOperation: (FileOperation) -> Unit
) {

  private var isObserving: Boolean = false

  private val eventsToObserve = CREATE or MODIFY or MOVED_FROM or MOVED_TO or DELETE

  //
  private var fileObserver: FileObserver? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
      MyFileObserver(
        dir,
        eventsToObserve,
        onFileOperation
      )
    else
      MyFileObserver(
        dir.path,
        eventsToObserve,
        onFileOperation
      )

  fun start() {
    //
    fileObserver?.startWatching()
    //
    isObserving = true
  }

  fun stop() {
    Timber.d("stop - dir: $dir")
    //
    fileObserver?.stopWatching()
    fileObserver = null
    //
    isObserving = false
  }

}

internal class MyFileObserver : FileObserver {

  private var dir: FileInfo
  private var onFileOperation: (FileOperation) -> Unit

  //For Testing only
  private var shortParentDir = ""

  @RequiresApi(Build.VERSION_CODES.Q)
  constructor(file: FileInfo, mask: Int, onFileOperation: (FileOperation) -> Unit) : super(
    file,
    mask
  ) {
    this.dir = file
    this.onFileOperation = onFileOperation
    this.shortParentDir = file.path.replace(VolumeObserver.testMainDir, "")
  }

  constructor(file: String, mask: Int, onFileOperation: (FileOperation) -> Unit) : super(
    file,
    mask
  ) {
    this.dir = FileInfo(file)
    this.onFileOperation = onFileOperation
    this.shortParentDir = file.replace(VolumeObserver.testMainDir, "")
  }

  /*
      FileObserver events
      public static final int ACCESS = 1;
      public static final int ALL_EVENTS = 4095;
      public static final int ATTRIB = 4;
      public static final int CLOSE_NOWRITE = 16;
      public static final int CLOSE_WRITE = 8;
      public static final int CREATE = 256;
      public static final int DELETE = 512;
      public static final int DELETE_SELF = 1024;
      public static final int MODIFY = 2;
      public static final int MOVED_FROM = 64;
      public static final int MOVED_TO = 128;
      public static final int MOVE_SELF = 2048;
      public static final int OPEN = 32;
  */

  override fun onEvent(event: Int, fileName: String?) {

    //important to remove all extra flags from the event using bitwise AND operator
    val evenID = event and ALL_EVENTS
    Timber.d("Thread: ${Thread.currentThread().name} - onEvent: $evenID - shortParentDir: $shortParentDir")

    // return if filename is null because we want to handle
    // only events for sub file/folders in this directory
    // and ignore the events of the directory itself
    if (fileName == null) {
      //Timber.d("ignore event for the directory itself")
      return
    }

    //
    val file = FileInfo("${dir.path}$fileName")

    // ignore system hidden files which its name start with .
    // i.e path/.sys
    // i.e path/.thumbnails
    // etc
    if (file.isHiddenFile()) {
      return
    }


    when (evenID) {

      CREATE -> { // check if its a "create"
        Timber.d("onEvent: $evenID (CREATE) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")

        if (file.exists()) {
          val fileOperation = FileOperation(file, FileEvent.CREATE)
          onFileOperation(fileOperation)
        }

      }

      MODIFY -> {
        Timber.d("onEvent: $evenID (MODIFY) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")

        // MODIFY Event needed only for files, as no need for this event for folders then ignore if folder
        if (file.exists() && !file.isDirectory) {
          val fileOperation = FileOperation(file, FileEvent.MODIFY)
          onFileOperation(fileOperation)
        }
      }

      MOVED_FROM -> {
        Timber.d("onEvent: $evenID (MOVED_FROM) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()} - isDir: ${file.isDirectory}")

        val name = file.name
        val extension = file.extension
        val nameWithoutExtension = file.nameWithoutExtension
        Timber.d("name: $name - extension: $extension - nameWithoutExtension: $nameWithoutExtension")

        val fileOperation = FileOperation(file, FileEvent.MOVED_FROM)
        onFileOperation(fileOperation)
      }

      MOVED_TO -> {
        Timber.d("onEvent: $evenID (MOVED_TO) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")

        if (file.exists()) {
          val fileOperation = FileOperation(file, FileEvent.MOVED_TO)
          onFileOperation(fileOperation)
        }
      }

      MOVE_SELF -> {
        Timber.d("onEvent: $evenID (MOVE_SELF) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")

      }
      DELETE -> {
        Timber.d("onEvent: $evenID (DELETE) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")

        val fileOperation = FileOperation(file, FileEvent.DELETE)
        onFileOperation(fileOperation)
      }

      DELETE_SELF -> {
        Timber.d("onEvent: $evenID (DELETE_SELF) - parentDir: $shortParentDir - file: $fileName - exists: ${file.exists()}")
      }
    }
  }
}

internal data class FileOperation(
  val file: FileInfo,
  val event: FileEvent = FileEvent.NONE,
  var fileKey: String = file.fileKey, // a unique identifier for file/folder using storageDeviceID+Inode
  val time: Long = Date().time,
  var pendingDeleteJob: Job? = null,
  var pendingModifyJob: Job? = null
) {
  fun updateFileKey(fileKey: String) {
    Timber.d("updateFileKey()")
    this.fileKey = fileKey
    this.file.fileKey =
      fileKey //important to update the file object with the fileKey value too, as we will use the fileKey as ID in any DB operation
  }
}

enum class FileEvent {
  NONE, CREATE, MODIFY, MOVED_FROM, MOVED_TO, DELETE
}