import { blocksPerPart, numberOfPartsOnFS } from '../util/parts'
import { bytesToHex } from '../util/hex'
import { WebAccountMiddleware } from '../middleware/webAccountMiddleware'
import { Downloader } from '../filesystem-access/downloader'
import { extractPromise } from '../util/promise'
import { serializeEncrypted } from '../util/serializeEncrypted'
import { FileMetadata } from '../account-system/AccountSystem'
import { numberOfBlocks, sizeOnFS } from '../util/blocks'

export type OpaqueDownloadConfig = {
  storageNode: string

  crypto: WebAccountMiddleware

  queueSize?: {
    net?: number
    decrypt?: number
  }
}

export type OpaqueDownloadArgs = {
  config: OpaqueDownloadConfig
  handle: Uint8Array
  name: string
  fileMeta: FileMetadata
}

export class OpaqueDownload implements Downloader {
  readonly public = false

  config: OpaqueDownloadConfig

  _location = extractPromise<Uint8Array>()
  _encryptionKey = extractPromise<Uint8Array>()

  async getLocation(): Promise<Uint8Array> {
    return this._location[0]
  }

  async getEncryptionKey(): Promise<Uint8Array> {
    return this._encryptionKey[0]
  }

  _name: string

  _fileMeta: FileMetadata

  get name() {
    return this._name
  }

  _size?: number
  _sizeOnFS?: number
  _numberOfBlocks?: number
  _numberOfParts?: number

  get size() {
    return this._size
  }

  get sizeOnFS() {
    return this._sizeOnFS
  }

  _downloadUrl?: string
  _metadata?: FileMetadata

  _beforeDownload?: (d: Downloader) => Promise<void>
  _afterDownload?: (d: Downloader) => Promise<void>

  constructor({ config, handle, name, fileMeta }: OpaqueDownloadArgs) {
    this.config = config
    this.config.queueSize = this.config.queueSize || {}
    this.config.queueSize.net = this.config.queueSize.net || 3
    this.config.queueSize.decrypt = this.config.queueSize.decrypt || blocksPerPart

    this._location[1](handle.slice(0, 32))
    this._encryptionKey[1](handle.slice(32))

    this._name = name

    this._fileMeta = fileMeta
  }

  async getDownloadUrl(): Promise<string | undefined> {
    if (this._downloadUrl) {
      return this._downloadUrl
    }

    const d = this

    const response = await fetch(d.config.storageNode + '/api/v1/download', {
      method: 'POST',
      body: JSON.stringify({ fileID: bytesToHex(await d.getLocation()) }),
    })

    const data = await response.json()

    const downloadUrl = data.fileDownloadUrl + '/file'

    this._downloadUrl = downloadUrl

    return downloadUrl
  }

  async getMetadata(): Promise<FileMetadata | undefined> {
    if (this._fileMeta) {
      return this._fileMeta
    }
    if (this._metadata) {
      return this._metadata
    }

    const d = this

    if (!this._downloadUrl) {
      await this.getDownloadUrl()
    }

    const response = await fetch(this._downloadUrl + '/metadata', { method: 'GET' })
    const data = await response.json()

    const metadata = await serializeEncrypted<FileMetadata>(
      d.config.crypto,
      new Uint8Array(data),
      await d.getEncryptionKey(),
    )
    // old uploads will not have this defined
    metadata.lastModified = metadata.lastModified || Date.now()
    d._metadata = metadata

    return metadata
  }

  async startDownload() {
    const d = this
    if (this._beforeDownload) {
      await this._beforeDownload(d)
    }

    let downloadUrl = await d.getDownloadUrl()
    if (!downloadUrl) {
      return
    }

    const metadata = await d.getMetadata()
    if (!metadata) {
      return
    }

    d._size = metadata.size
    d._sizeOnFS = sizeOnFS(metadata.size)
    d._numberOfBlocks = numberOfBlocks(d._size)
    d._numberOfParts = numberOfPartsOnFS(d._sizeOnFS)
  }
}
