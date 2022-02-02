import { blockSize, blockSizeOnFS, numberOfBlocks, sizeOnFS } from '../util/blocks'
import { bytesToHex } from '../util/hex'
import { extractPromise } from '../util/promise'
import { FileMeta } from '../filesystem-access/filemeta'
import { getPayload, getPayloadFD } from '../util/payload'
import { numberOfPartsOnFS, partSize } from '../util/parts'
import { OQ } from '../util/oqueue'
import { Retry } from '../util/retry'
import { TransformStream, WritableStream, Uint8ArrayChunkStream } from '../util/streams'
import { Uploader } from '../filesystem-access/uploader'
import { CryptoMiddleware } from '../interfaces/CryptoMiddleware'

export type OpaqueUploadConfig = {
  storageNode: string
  crypto: CryptoMiddleware
  queueSize?: {
    encrypt?: number
    net?: number
  }
}

export type OpaqueUploadArgs = {
  config: OpaqueUploadConfig
  path: string
  name: string
  meta: FileMeta
}

type UploadInitPayload = {
  fileHandle: string
  fileSizeInByte: number
  endIndex: number
}

type UploadInitExtraPayload = {
  metadata: Uint8Array
}

type UploadPayload = {
  fileHandle: string
  partIndex: number
  endIndex: number
}

type UploadExtraPayload = {
  chunkData: Uint8Array
}

type UploadStatusPayload = {
  fileHandle: string
}

export class OpaqueUpload implements Uploader {
  readonly public = false

  config: OpaqueUploadConfig
  _location?: Uint8Array
  _encryptionKey?: Uint8Array

  _locationExtractedPromise = extractPromise<Uint8Array>()
  _encryptionKeyExtractedPromise = extractPromise<Uint8Array>()

  private async _generateKeys() {
    if (this._location && this._encryptionKey) {
      return
    }

    if (this._location && this._encryptionKey) {
      return
    }

    this._location = await this.config.crypto.getRandomValues(32)
    this._encryptionKey = await this.config.crypto.generateSymmetricKey()

    this._locationExtractedPromise[1](this._location)
    this._encryptionKeyExtractedPromise[1](this._encryptionKey)
  }

  async getLocation(): Promise<Uint8Array> {
    await this._generateKeys()

    return await this._locationExtractedPromise[0]
  }

  async getEncryptionKey(): Promise<Uint8Array> {
    await this._generateKeys()

    return await this._encryptionKeyExtractedPromise[0]
  }

  _cancelled = false
  _errored = false
  _started = false
  _done = false
  _paused = false

  get cancelled() {
    return this._cancelled
  }

  get errored() {
    return this._errored
  }

  get started() {
    return this._started
  }

  get done() {
    return this._done
  }

  get paused() {
    return this._paused
  }

  _unpaused = Promise.resolve()
  _unpause?: (value: void) => void

  _finished: Promise<void>
  _resolve: (value?: void) => void
  _reject: (reason?: any) => void

  _size: number
  _sizeOnFS: number
  _numberOfBlocks: number
  _numberOfParts: number

  get size() {
    return this._size
  }

  get sizeOnFS() {
    return this._sizeOnFS
  }

  _name: string
  _path: string
  _metadata: FileMeta

  get name() {
    return this._name
  }

  get path() {
    return this._path
  }

  get metadata() {
    return this._metadata
  }

  _netQueue?: OQ<Uint8Array>
  _encryptQueue?: OQ<Uint8Array>

  _output?: TransformStream<Uint8Array, Uint8Array>

  get output() {
    return this._output
  }

  _timestamps: { start?: number; end?: number; pauseDuration: number } = {
    start: undefined,
    end: undefined,
    pauseDuration: 0,
  }

  get startTime() {
    return this._timestamps.start
  }

  get endTime() {
    return this._timestamps.end
  }

  get pauseDuration() {
    return this._timestamps.pauseDuration
  }

  _beforeUpload?: (u: Uploader) => Promise<void>
  _afterUpload?: (u: Uploader) => Promise<void>

  async pause() {
    if (this._paused) {
      return
    }

    const t = Date.now()

    const [unpaused, unpause] = extractPromise()
    this._unpaused = unpaused
    this._unpause = () => {
      this._timestamps.pauseDuration += Date.now() - t
      unpause()
    }
    this._paused = true
  }

  async unpause() {
    if (this._unpause) {
      this._unpause()
      this._unpause = undefined
      this._paused = false
    }
  }

  constructor({ config, name, path, meta }: OpaqueUploadArgs) {
    this.config = config
    this.config.queueSize = this.config.queueSize || {}
    this.config.queueSize.encrypt = this.config.queueSize.encrypt || 3
    this.config.queueSize.net = this.config.queueSize.net || 1

    this._name = name
    this._path = path
    this._metadata = meta

    this._size = this._metadata.size
    this._sizeOnFS = sizeOnFS(this._size)
    this._numberOfBlocks = numberOfBlocks(this._size)
    this._numberOfParts = numberOfPartsOnFS(this._sizeOnFS)

    const u = this

    const [finished, resolveFinished, rejectFinished] = extractPromise()
    this._finished = finished
    this._resolve = val => {
      u._done = true
      resolveFinished(val)

      this._timestamps.end = Date.now()
    }
    this._reject = err => {
      u._errored = true

      u.pause()

      rejectFinished(err)
    }
  }

  async start(): Promise<TransformStream<Uint8Array, Uint8Array> | undefined> {
    if (this._cancelled || this._errored) {
      return
    }

    if (this._started) {
      return this._output
    }

    this._started = true
    this._timestamps.start = Date.now()

    const u = this

    if (this._beforeUpload) {
      await this._beforeUpload(u).catch(u._reject)
    }

    const encryptedMeta = await u.config.crypto.encrypt(
      await u.getEncryptionKey(),
      new TextEncoder().encode(
        JSON.stringify({
          lastModified: u._metadata.lastModified,
          size: u._metadata.size,
          type: u._metadata.type,
        } as FileMeta),
      ),
    )

    const fd = await getPayloadFD<UploadInitPayload, UploadInitExtraPayload>({
      crypto: u.config.crypto,
      payload: {
        fileHandle: bytesToHex(await u.getLocation()),
        fileSizeInByte: u._sizeOnFS,
        endIndex: numberOfPartsOnFS(u._sizeOnFS),
      },
      extraPayload: {
        metadata: encryptedMeta,
      },
    })

    await fetch(this.config.storageNode + '/api/v1/init-upload', {
      method: 'POST',
      body: fd,
    })

    const encryptQueue = new OQ<Uint8Array | undefined>(this.config.queueSize!.encrypt, Number.MAX_SAFE_INTEGER)
    const netQueue = new OQ<Uint8Array | undefined>(this.config.queueSize!.net)

    u._encryptQueue = encryptQueue
    u._netQueue = netQueue

    let blockIndex = 0
    let partIndex = 0

    const partCollector = new Uint8ArrayChunkStream(
      partSize,
      new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.net! * partSize + 1 }),
      new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.net! * partSize + 1 }),
    )

    u._output = new TransformStream<Uint8Array, Uint8Array>(
      {
        transform(chunk, controller) {
          controller.enqueue(chunk)
        },
      },
      new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.net! * partSize + 1 }),
    ) as TransformStream<Uint8Array, Uint8Array>

    u._output.readable.pipeThrough(partCollector).pipeTo(
      new WritableStream<Uint8Array>({
        async write(part) {
          // console.log("write part")

          const p = new Uint8Array(sizeOnFS(part.length))

          netQueue.add(
            partIndex++,
            async partIndex => {
              if (u._cancelled || u._errored) {
                return
              }

              for (let i = 0; i < numberOfBlocks(part.length); i++) {
                const block = part.slice(i * blockSize, (i + 1) * blockSize)

                encryptQueue.add(
                  blockIndex++,
                  async () => {
                    if (u._cancelled || u._errored) {
                      return
                    }

                    return await u.config.crypto.encrypt(await u.getEncryptionKey(), block)
                  },
                  async encrypted => {
                    // console.log("write encrypted")

                    if (!encrypted) {
                      return
                    }

                    let byteIndex = 0
                    for (const byte of encrypted) {
                      p[i * blockSizeOnFS + byteIndex] = byte
                      byteIndex++
                    }
                  },
                )
              }

              await encryptQueue.waitForCommit(blockIndex - 1)

              const res = await new Retry(
                async () => {
                  const fd = await getPayloadFD<UploadPayload, UploadExtraPayload>({
                    crypto: u.config.crypto,
                    payload: {
                      fileHandle: bytesToHex(await u.getLocation()),
                      partIndex: partIndex + 1,
                      endIndex: u._numberOfParts,
                    },
                    extraPayload: {
                      chunkData: p,
                    },
                  })

                  return await fetch(this.config.storageNode + '/api/v1/upload', {
                    method: 'POST',
                    body: fd,
                  })
                },
                {
                  firstTimer: 500,
                  handler: err => {
                    console.warn(err)

                    return false
                  },
                },
              )
                .start()
                .catch(u._reject)

              if (!res) {
                return
              }

              // console.log(res)

              return p
            },
            async part => {
              if (!part) {
                return undefined
              }
            },
          )
        },
        async close() {
          await encryptQueue.waitForClose()
        },
      }) as WritableStream<Uint8Array>,
    )

    encryptQueue.add(
      numberOfBlocks(u._size),
      () => null,
      async () => {
        encryptQueue.close()
      },
    )

    netQueue.add(
      u._numberOfParts,
      () => undefined,
      async () => {
        const data = await getPayload<UploadStatusPayload>({
          crypto: u.config.crypto,
          payload: {
            fileHandle: bytesToHex(await u.getLocation()),
          },
        })

        await fetch(this.config.storageNode + '/api/v1/upload-status', {
          method: 'POST',
          body: JSON.stringify(data),
        })

        // console.log(res)

        netQueue.close()
      },
    )

    Promise.all([encryptQueue.waitForClose(), netQueue.waitForClose()]).then(async () => {
      if (this._afterUpload) {
        await this._afterUpload(u).catch(u._reject)
      }

      u._resolve()
    })

    return u._output
  }

  async finish() {
    return this._finished
  }

  async cancel() {
    this._cancelled = true
    this._reject()
  }
}
