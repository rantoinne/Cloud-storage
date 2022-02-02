package com.opacity.androidsdk.filesys

import com.google.common.hash.Hashing
import com.google.common.io.Files
import kotlinx.coroutines.*
import timber.log.Timber

internal class FilesChecksum(
  private val rootScope: CoroutineScope,
  private val isAsync: Boolean = true
) {

  suspend fun hashFiles(
    files: MutableList<FileInfo>,
    callback: suspend (MutableList<FileInfo>) -> Unit
  ) {
    Timber.d("hashFiles()")
    //
    var currentIndex = 0
    val lock = Any()
    val hashingThreads = mutableListOf<FileHashingThread>()

    //
    val getFile: (String) -> FileInfo? = {
      var file: FileInfo? = null
      synchronized(lock) {
        Timber.d("$it request - getFile - currentIndex: $currentIndex")

        if (currentIndex >= files.size) {
          //no more files to return! then ignore
          return@synchronized
        }

        //pass the next file to the target thread
        file = files[currentIndex]
        currentIndex++

      }

      file
    }

    //run threads based on the maximum threads value
    for (i in 1..MAXIMUM_PARALLEL_OPERATION) {
      val hashingThread = FileHashingThread(rootScope)
      hashingThreads.add(hashingThread)
      //
      hashingThread.start(getFile)
    }

    val checkHashingStatus: suspend () -> Unit = {
      var isTasksCompleted: Boolean
      while (true) {
        Timber.d("Checking hashing threads status - thread name: ${Thread.currentThread().name}")
        isTasksCompleted = true
        //
        for (thread in hashingThreads) {
          if (thread.status == ThreadStatus.RUNNING) {
            isTasksCompleted = false
          }
        }

        if (isTasksCompleted) {
          break
        }
        delay(1000)
      }

      Timber.d("Hashed all files, send results")
      //hashing files finished, send results
      callback(files)
    }

    //checking threads status
    //if Async then move checking in a separate thread
    //if Sync then block until hashing operation for all files is finished
    if (isAsync) {
      rootScope.launch {
        checkHashingStatus()
      }
    } else {
      checkHashingStatus()
    }
  }

  companion object {

    const val MAXIMUM_PARALLEL_OPERATION = 10
    const val MINIMUM_THRESHOLD = 104_857_600 // 100Mb

    fun calculateSHA256Hash(file: FileInfo): String =
      Files.asByteSource(file).hash(Hashing.sha256()).toString()
  }

}

private class FileHashingThread(private val rootScope: CoroutineScope) {
  var name: String = ""
  var status: ThreadStatus = ThreadStatus.IDLE

  fun start(getFile: (String) -> FileInfo?) {
    rootScope.launch(Dispatchers.IO) {
      //
      name = Thread.currentThread().name
      status = ThreadStatus.RUNNING
      //
      while (true) {
        val targetFile = getFile(name)
        if (targetFile == null) {
          //if null then there is no more files to operate
          Timber.d("$name - stop execution - no more files!")
          break
        }

        Timber.d("$name - file: ${targetFile.path}")
        try {
          val sha256 = FilesChecksum.calculateSHA256Hash(targetFile)
          targetFile.sha256Hash = sha256
          Timber.d("$name - fileSha256: $sha256")
        } catch (e: Exception) {
          Timber.d("FileHashingThread() - failed - error: $e - path: $targetFile")
          Timber.e("FileHashingThread() - failed - error: $e - path: $targetFile")
        }

      }

      //
      status = ThreadStatus.FINISHED
      Timber.d("Thread - $name - finished")
    }
  }
}

private enum class ThreadStatus {
  IDLE, RUNNING, FINISHED
}