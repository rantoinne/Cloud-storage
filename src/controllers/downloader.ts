import { FileUploader, MetaController } from '@controllers'
import { FileDownloadStatusType } from '@models/stores/models'
import { OpaqueDownload, hex } from 'opacity-library'
import { Platform } from 'react-native'
import ReactNativeBlobUtil from 'react-native-blob-util'
import Share from 'react-native-share'

const { Thread } = require('react-native-threads')

const fileStatusesToAbort = ['cancelled', 'failed']
class FileToDownload {
  identifier: string
  runningProcesses: Array<any>
  hasCanceled: boolean
  hasDownloadStarted: boolean
  completedParts: number
  totalParts: number

  constructor(identifier: string) {
    this.identifier = identifier
    this.hasDownloadStarted = true
    this.runningProcesses = []
    this.hasCanceled = false
    this.completedParts = 0
  }

  setNumberOfParts(parts: number): void {
    this.totalParts = parts
  }

  completePart(): void {
    this.completedParts++
  }

  percentageCompleted(): number {
    return (this.completedParts / this.totalParts) * 100
  }

  clearThreads(): void {
    this.runningProcesses = []
  }

  removeThread(thread: any): void {
    const targetThreads = this.runningProcesses?.filter(t => {
      if (t.id === thread.id) {
        console.log('removing thread with id', thread.id)
        return null
      }
      return t
    })
    this.runningProcesses = targetThreads
  }

  async cancelDownload() {
    this.hasCanceled = true
    await Promise.all(
      this.runningProcesses.map(async thread => {
        console.log(`Terminating thread with id ${thread.id}`)
        await thread.terminate()
      }),
    )
    this.clearThreads()
  }
}

export class FileDownloader {
  static readonly pendingThreadRequests = []
  static runningThreadsCount = 0
  static filesInDownload: FileToDownload[] = []

  static async isDownloadCancellable() {
    return this.filesInDownload.length > 0
  }

  static async getLatestFileToDownload() {
    return this.filesInDownload.find(() => true)
  }

  static async removeCurrentFileInQueue(file: FileToDownload) {
    this.filesInDownload.filter(f => f.identifier !== file.identifier)
  }

  static async addCurrentFileInQueue(file: FileToDownload) {
    this.filesInDownload.push(file)
  }

  static async cancelPendingDownload() {
    const file: FileToDownload = await this.getLatestFileToDownload()
    await file.cancelDownload()
    this.filesInDownload = []
    file.runningProcesses = []
    this.runningThreadsCount = 0
  }

  static isFileDownloading() {
    return FileDownloader.filesInDownload.length > 0
  }

  static getMaxThreadsForDownloading() {
    let MAX_THREADS = Platform.OS === 'ios' ? 5 : 3
    if (FileUploader.isFileUploading()) MAX_THREADS = Math.floor(MAX_THREADS / 2)
    console.log('max running downloading threads is ', MAX_THREADS)
    return MAX_THREADS
  }

  static async fileDownload(
    location: string,
    onProgress: (status: string, progress?: number, filePath?: string, fileName?: string) => void,
    previousStatus: FileDownloadStatusType,
  ) {
    const fileToDownload = new FileToDownload(location)
    FileDownloader.addCurrentFileInQueue(fileToDownload)

    const file = await MetaController.accountSystem.getFileMetadata(hex.hexToBytes(location))
    const opaqueDownload = new OpaqueDownload({
      handle: file.private.handle,
      config: MetaController.config,
      name: file.name,
      fileMeta: file,
    })

    await opaqueDownload.startDownload()

    // + 2 because we will start the download then serialize the download to disk
    fileToDownload.setNumberOfParts(opaqueDownload._numberOfParts + 2)
    fileToDownload.completePart()
    onProgress('in-progress', fileToDownload.percentageCompleted(), null, file.name)

    const key = await opaqueDownload.getEncryptionKey()

    const fileBuffer = Array(opaqueDownload._numberOfParts).fill('')

    await Promise.all(
      Array(opaqueDownload._numberOfParts)
        .fill(0)
        .map(async (_, partIndex) => {
          if (fileToDownload.hasCanceled) {
            console.log('exiting before threads have been made and canceling')
            onProgress('cancelled', 0, null, file.name)
            return
          }

          await this.requestStartNewThread()
          const data = {
            key: Buffer.from(key).toString('base64'),
            partIndex,
            downloadUrl: opaqueDownload._downloadUrl,
            _sizeOnFS: opaqueDownload._sizeOnFS,
          }

          return new Promise(resolve => {
            const workerThread = new Thread('./download.thread.js')
            console.log('thread created', JSON.stringify(workerThread))
            fileToDownload.runningProcesses.push(workerThread)
            const payload = JSON.stringify(data)
            workerThread.postMessage(payload)
            workerThread.onmessage = (response: string) => {
              if (fileToDownload.hasCanceled) {
                onProgress('cancelled', 0, null, file.name)
                console.log('exiting before threads have been made and canceling')
                return
              }
              fileBuffer[partIndex] = JSON.parse(response).join('')
              fileToDownload.completePart()
              const progress = fileToDownload.percentageCompleted()
              console.log({ progress })
              if (fileStatusesToAbort.includes(previousStatus)) {
                console.log('got previous path as cancelled/failed: ABORTING')
                onProgress(previousStatus, 0, null, file.name)
                return
              }
              onProgress('in-progress', progress, null, file.name)
              workerThread.terminate()
              this.notifyThreadTerminate()
              fileToDownload.removeThread(workerThread)
              resolve(true)
            }
          })
        }),
    ).catch(error => {
      onProgress('failed', 0, null, file.name)
      FileDownloader.removeCurrentFileInQueue(fileToDownload)
      console.log(error)
    })

    FileDownloader.removeCurrentFileInQueue(fileToDownload)

    if (fileToDownload.hasCanceled) {
      console.log('exiting before threads have been made and canceling')
      onProgress('cancelled', 0, null, file.name)
      return
    }

    if (fileStatusesToAbort.includes(previousStatus)) {
      console.log('got previous path as cancelled/failed: ABORTING')
      onProgress(previousStatus, 0, null, file.name)
      return
    }

    const downloadedFile = Buffer.from(fileBuffer.join(''), 'binary').toString('base64')

    let filePath = ''
    if (Platform.OS === 'android') {
      filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${file.name}`
      let fileName = file.name
      ReactNativeBlobUtil.fs.exists(filePath).then(exists => {
        if (exists) {
          const name = file.name.split('.')
          fileName = `${name[0]}-${new Date().getTime()}.${name[1]}`
          filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`
        }
        ReactNativeBlobUtil.fs.createFile(filePath, downloadedFile, 'base64').then(async () => {
          ReactNativeBlobUtil.android.addCompleteDownload({
            title: fileName,
            description: 'Download complete',
            mime: file.type,
            path: filePath,
            showNotification: true,
          })
        })
      })
      onProgress('success', 100, filePath, fileName)
    } else {
      filePath = ReactNativeBlobUtil.fs.dirs.CacheDir + `/${file.name}`
      const downloadedFile = Buffer.from(fileBuffer.join(''), 'binary').toString('base64')
      await ReactNativeBlobUtil.fs.unlink(filePath).catch(console.log)
      ReactNativeBlobUtil.fs
        .createFile(ReactNativeBlobUtil.fs.dirs.CacheDir + `/${file.name}`, downloadedFile, 'base64')
        .then(async () => {
          try {
            onProgress('success', 100, filePath, file.name)
          } catch (error) {
            console.log(error)
            onProgress('failed', 0, '', file.name)
          }
        })
    }
  }

  static requestStartNewThread(): Promise<void> {
    return new Promise(resolve => {
      if (this.runningThreadsCount < this.getMaxThreadsForDownloading()) {
        this.runningThreadsCount += 1
        resolve()
      } else {
        this.pendingThreadRequests.push(resolve)
      }
    })
  }

  static notifyThreadTerminate() {
    if (this.pendingThreadRequests.length > 0) {
      this.pendingThreadRequests[0]()
      this.pendingThreadRequests.shift()
    } else {
      this.runningThreadsCount -= 1
    }
  }

  static async saveOrShareFileAfterDownload(file: any) {
    try {
      const options = {
        type: file.type,
        filename: file.name,
        url: Platform.OS === 'android' ? `file://${file.path}` : file.path,
      }
      await Share.open({ ...options })
    } catch (error) {
      console.log(error)
    }
  }
}
