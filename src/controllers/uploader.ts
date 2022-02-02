import { OpaqueUpload, parts, hex, keccak256, bindUploadToAccountSystem, Buffer } from 'opacity-library'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { MetaController } from './meta'
import { Platform } from 'react-native'
import lodashChunks from 'lodash/chunk'
import { FileDownloader } from '@controllers'
const { Thread } = require('react-native-threads')

const endpoint = {
  initUpload: { url: '/api/v1/init-upload' },
  upload: { url: '/api/v1/upload' },
  uploadStatus: { url: '/api/v1/upload-status' },
}

class FileToUpload {
  identifier: string
  runningProcesses: Array<any>
  hasCanceled: boolean
  hasUploadStarted: boolean
  completedParts: number
  totalParts: number

  constructor(identifier: string) {
    this.identifier = identifier
    this.hasUploadStarted = true
    this.runningProcesses = []
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
    console.log(`removing all threads`)
    this.runningProcesses = []
  }

  removeThread(thread: any): void {
    console.log(`Removing threads from file ${this.identifier}`)
    this.runningProcesses = this.runningProcesses.filter(t => t.id !== thread.id)
  }

  cancelUpload(): void {
    if (this.hasCanceled) return
    this.hasCanceled = true
    console.log(`Canceling pending uploads`)
    this.runningProcesses.forEach(thread => {
      console.log(`Terminating thread with id ${thread.id}`)
      thread.terminate()
    })
    this.clearThreads()
  }
}

export class FileUploader {
  static filesInUpload: { [identifier: string]: FileToUpload } = {}

  static addToQueue(file: FileToUpload) {
    FileUploader.filesInUpload[file.identifier] = file
  }

  static async removeFromQueue(identifier: string, cancelThread = false) {
    const file = FileUploader.filesInUpload[identifier]
    if (file) {
      delete FileUploader.filesInUpload[identifier]
      if (cancelThread) {
        await file.cancelUpload()
      }
    }
  }

  static isFileUploading() {
    return Object.entries(FileUploader.filesInUpload).length > 0
  }

  static getMaxThreadsForUploading() {
    let MAX_RUNNING_THREADS = Platform.OS === 'ios' ? 5 : 3
    if (FileDownloader.isFileDownloading()) MAX_RUNNING_THREADS = Math.floor(MAX_RUNNING_THREADS / 2)
    console.log('max running uploading threads is ', MAX_RUNNING_THREADS)
    return MAX_RUNNING_THREADS
  }

  static async uploadFile(
    file: { size: number; type: string; name: string; path: string; destDir: string },
    onProgress?: (status: string, progress?: number) => void,
  ) {
    console.log('uploadFile() - file:', file)
    // We only upload 1 file at a time, so collision is not an issue
    const fileToUpload = new FileToUpload(file.path)
    FileUploader.addToQueue(fileToUpload)
    onProgress('in-progress')
    try {
      const opaqueUpload = await getUploaderObj(file)
      bindUploadToAccountSystem(MetaController.accountSystem, opaqueUpload)
      await opaqueUpload._beforeUpload(opaqueUpload)
      await initUpload(opaqueUpload)
      if (fileToUpload.hasCanceled) {
        onProgress('failed', 0)
        return
      }
      // + 2 because one for starting upload meta, one for ending upload meta
      const noOfParts = parts.numberOfPartsOnFS(opaqueUpload._sizeOnFS) + 2
      fileToUpload.setNumberOfParts(noOfParts)
      // to mark the initUpload complete
      fileToUpload.completePart()
      onProgress('in-progress', fileToUpload.percentageCompleted())
      const chunks = []
      ReactNativeBlobUtil.fs
        .readStream(`${decodeURI(file.path.replace('file://', ''))}`, 'base64', parts.partSize, 2000)
        .then(ifstream => {
          ifstream.open()
          ifstream.onData(chunk => chunk && chunks.push(chunk))
          ifstream.onError(error => {
            onProgress('failed')
            console.log('error file streaming', error)
          })
          ifstream.onEnd(async () => {
            try {
              const key = await opaqueUpload.getEncryptionKey()
              const arrayChunk = lodashChunks(chunks, FileUploader.getMaxThreadsForUploading())
              for (let index = 0; index < arrayChunk.length; index++) {
                await Promise.all(
                  arrayChunk[index].map(async (chunk, i) => {
                    const arrayBuffer = new Uint8Array(Buffer.from(chunk, 'base64'))
                    const requestBody = JSON.stringify({
                      fileHandle: hex.bytesToHex(await opaqueUpload.getLocation()),
                      partIndex: index * FileUploader.getMaxThreadsForUploading() + i + 1,
                      endIndex: opaqueUpload._numberOfParts,
                    })
                    const hash = new Uint8Array(keccak256.arrayBuffer(requestBody))
                    const statusPayload = JSON.stringify({
                      hash: hex.bytesToHex(hash),
                      publicKey: hex.bytesToHex(await opaqueUpload.config.crypto.getPublicKey(undefined)),
                      signature: hex.bytesToHex(await opaqueUpload.config.crypto.sign(undefined, hash)),
                    })
                    const data = {
                      requestBody,
                      statusPayload,
                      arrayBuffer: hex.bytesToHex(arrayBuffer),
                      key: hex.bytesToHex(key),
                      type: opaqueUpload.metadata.type,
                      uploadURL: MetaController.storageNode + endpoint.upload.url,
                      initialIv: opaqueUpload.config.crypto.getCryptoRandomValue(16).toString('base64'),
                    }
                    // If we try to cancel before all of our threads have spawned, it won't work
                    // This allows us to cancel while spawning thread if the request came in earlier
                    if (fileToUpload.hasCanceled) {
                      console.log('exiting before threads have been made and canceling')
                      return
                    }
                    return new Promise(resolve => {
                      const workerThread = new Thread('./worker.thread.js')
                      fileToUpload.runningProcesses.push(workerThread)
                      const payload = JSON.stringify(data)
                      workerThread.postMessage(payload)
                      workerThread.onmessage = async response => {
                        console.log('Response from thread:', response)
                        fileToUpload.completePart()
                        const progress = fileToUpload.percentageCompleted()
                        onProgress('in-progress', progress)
                        workerThread.terminate()
                        fileToUpload.removeThread(workerThread)
                        resolve(true)
                      }
                    })
                  }),
                )
              }

              FileUploader.removeFromQueue(fileToUpload.identifier)

              if (fileToUpload.hasCanceled) {
                onProgress('failed', 0)
                console.log('canceled upload')
                return
              }

              await opaqueUpload._afterUpload(opaqueUpload)
              const status = await uploadStatus(opaqueUpload)
              console.log(status)
              onProgress('success', 100)
            } catch (error) {
              onProgress('failed')
              console.log('error uploading: ', error)
            }
          })
        })
    } catch (error) {
      onProgress('failed')
      console.log('error uploading: ', error)
    }
  }

  static FAIL_PROPAPILITY = 50 // % of failure
  static INTERVAL_IN_SEC = 0.25 // Time takes for each iteration in seconds
  static ITER_INCREMENT = 5 // Progress increment % for each iteration
  // eslint-disable-next-line camelcase
  static async __DEV__uploadFileTest(
    file: { size: number; type: string; name: string; path: string; destDir: string; status: string },
    onProgress?: (status: string, progress?: number) => void,
  ) {
    let clock = 0
    let progress = 0
    const failProp = FileUploader.FAIL_PROPAPILITY / 100
    const interval = 1000 * FileUploader.INTERVAL_IN_SEC
    const fileToUpload = new FileToUpload(file.path)
    FileUploader.addToQueue(fileToUpload)

    const stopUpload = () => {
      clock && clearInterval(clock)
      FileUploader.removeFromQueue(fileToUpload.identifier)
    }

    onProgress('in-progress')

    clock = setInterval(() => {
      progress += FileUploader.ITER_INCREMENT
      console.log('file progress , path: ', progress, ' : ', file.path)
      console.log('actual file.status: ', file.status)

      /* in case file failed or canceled by user */
      if (file.status === 'failed' || fileToUpload.hasCanceled) {
        return stopUpload()
      }

      if (progress < 100) {
        onProgress('in-progress', progress)
      } else {
        onProgress(Math.random() > failProp ? 'success' : 'failed')
        return stopUpload()
      }
    }, interval)

    return stopUpload
  }

  static uploadFileTest = __DEV__ ? FileUploader.__DEV__uploadFileTest : FileUploader.uploadFile
}

const getEncoded = (uploader: OpaqueUpload) => {
  return new TextEncoder().encode(
    JSON.stringify({
      lastModified: uploader._metadata.lastModified,
      size: uploader._metadata.size,
      type: uploader._metadata.type,
    }),
  )
}

async function initUpload(uploader: OpaqueUpload): Promise<void> {
  const encryptionKey = await uploader.getEncryptionKey()
  const encoded = getEncoded(uploader)
  const encryptedMeta = await uploader.config.crypto.encrypt(encryptionKey, encoded)

  const requestBody = JSON.stringify({
    fileHandle: hex.bytesToHex(await uploader.getLocation()),
    fileSizeInByte: uploader._sizeOnFS,
    endIndex: uploader._numberOfParts,
  })

  console.log(requestBody)

  const hash = new Uint8Array(keccak256.arrayBuffer(requestBody))

  const statusPayload = {
    hash: hex.bytesToHex(hash),
    publicKey: hex.bytesToHex(await uploader.config.crypto.getPublicKey(undefined)),
    signature: hex.bytesToHex(await uploader.config.crypto.sign(undefined, hash)),
  }

  const res = await ReactNativeBlobUtil.fetch(
    'POST',
    uploader.config.storageNode + endpoint.initUpload.url,
    {
      'Content-Type': 'multipart/form-data',
    },
    [
      {
        name: 'metadata',
        filename: 'metadata',
        data: Buffer.from(encryptedMeta).toString('base64'),
      },
      // elements without property `filename` will be sent as plain text
      { name: 'requestBody', data: requestBody },
      { name: 'signature', data: statusPayload.signature },
      { name: 'hash', data: statusPayload.hash },
      { name: 'publicKey', data: statusPayload.publicKey },
    ],
  )

  return res.json()
}

async function uploadStatus(uploader: OpaqueUpload) {
  const requestBody = JSON.stringify({
    fileHandle: hex.bytesToHex(await uploader.getLocation()),
  })

  console.log(requestBody)

  const hash = new Uint8Array(keccak256.arrayBuffer(requestBody))

  const statusPayload = {
    hash: hex.bytesToHex(hash),
    publicKey: hex.bytesToHex(await uploader.config.crypto.getPublicKey(undefined)),
    signature: hex.bytesToHex(await uploader.config.crypto.sign(undefined, hash)),
  }
  const res = await fetch(uploader.config.storageNode + endpoint.uploadStatus.url, {
    method: 'POST',
    body: JSON.stringify({ ...statusPayload, requestBody }),
  })

  const data = await res.json()

  return data
}

async function getUploaderObj(file) {
  return new OpaqueUpload({
    config: MetaController.config,
    meta: {
      size: file.size,
      type: file.type,
      lastModified: 0,
    },
    name: file.name,
    path: file.destDir,
  })
}
