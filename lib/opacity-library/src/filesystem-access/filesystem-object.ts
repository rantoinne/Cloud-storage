import { bytesToHex } from '../util/hex'
import { CryptoMiddleware } from '../interfaces/CryptoMiddleware'
import { FileMeta } from './filemeta'
import { getPayload } from '../util/payload'
import { serializeEncrypted } from '../util/serializeEncrypted'
import ReactNativeBlobUtil from 'react-native-blob-util'

export interface IFileSystemObject {
  readonly public: boolean
  readonly private: boolean

  readonly handle: Uint8Array | undefined
  readonly location: Uint8Array | undefined

  exists(): Promise<boolean>
  metadata(): Promise<FileMeta>
  size(): Promise<number>

  _beforeDelete?: (o: IFileSystemObject) => Promise<void>
  _afterDelete?: (o: IFileSystemObject) => Promise<void>
  delete(): Promise<void>
  deleteMultiFile(files: []): Promise<void>

  _beforeConvertToPublic?: (o: IFileSystemObject) => Promise<void>
  _afterConvertToPublic?: (o: IFileSystemObject, res: PrivateToPublicResp) => Promise<void>
  convertToPublic(): Promise<void>
}

export class FileSystemObjectDeletionError extends Error {
  constructor(location: string, err: string) {
    super(`DeletionError: Failed to delete "${location}". Error: "${err}"`)
  }
}

export class FileSystemObjectConvertPublicError extends Error {
  constructor(reason: string) {
    super(`ConvertPublicError: Failed to convert file because ${reason}`)
  }
}

export class FileSystemObjectMissingDataError extends Error {
  constructor(type: string) {
    super(`MissingDataError: Missing ${type} from object properties`)
  }
}

type PrivateToPublicObj = {
  fileHandle: string
  fileSize: number
}

type PrivateToPublicResp = {
  s3_url: string
  s3_thumbnail_url: string
}

export type FileSystemObjectConfig = {
  crypto: CryptoMiddleware
  storageNode: string
}

export type FileSystemObjectArgs = {
  handle: Uint8Array | undefined
  location: Uint8Array | undefined
  fileSize?: number

  config: FileSystemObjectConfig
}

export class FileSystemObject implements IFileSystemObject {
  _handle?: Uint8Array
  _location?: Uint8Array
  _fileSize?: number

  get handle() {
    return this._handle
  }

  get location() {
    return this._location
  }

  get fileSize() {
    return this._fileSize
  }

  get public() {
    return !!this._location
  }

  get private() {
    return !!this._handle
  }

  config: FileSystemObjectConfig

  constructor({ handle, location, config, fileSize }: FileSystemObjectArgs) {
    this._handle = handle
    this._location = location
    this._fileSize = fileSize

    this.config = config
  }

  private async _getDownloadURL(): Promise<string> {
    if (this._handle) {
      const res = await fetch(this.config.storageNode + '/api/v2/download/private', {
        method: 'POST',
        body: JSON.stringify({
          fileID: bytesToHex(this._handle.slice(0, 32)),
        }),
      })

      const data = await res.text()

      if (res.status !== 200 || !data) {
        throw new Error('_getDownloadURL: failed to get download url')
      }

      return data
    }

    if (this._location) {
      const res = await fetch(this.config.storageNode + '/api/v2/download/public', {
        method: 'POST',
        body: JSON.stringify({
          fileID: bytesToHex(this._location.slice(0, 32)),
        }),
      })
      const data = await res.json()

      if (res.status !== 200 || !data) {
        throw new Error('_getDownloadURL: failed to get download url')
      }

      return data
    }

    throw new Error('_getDownloadURL: no valid sources found')
  }

  async exists() {
    if (!this._handle && !this._location) {
      console.warn(new Error('filesystem object already deleted'))

      return false
    }

    try {
      await this._getDownloadURL()

      return true
    } catch (err) {
      return false
    }
  }

  async metadata(): Promise<FileMeta> {
    if (!this._handle && !this._location) {
      throw new FileSystemObjectMissingDataError('handle and location')
    }

    const downloadURL = await this._getDownloadURL()

    const res = await ReactNativeBlobUtil.fetch('GET', downloadURL + '/metadata', {
      method: 'GET',
    })

    const status = res.info().status

    const base64 = await res.base64()

    const arrayBuffer = new Uint8Array(Buffer.from(base64, 'base64'))

    if (status !== 200) {
      throw new FileSystemObjectConvertPublicError(new TextDecoder().decode(arrayBuffer))
    }

    if (this._handle) {
      const serialized = await serializeEncrypted<FileMeta>(this.config.crypto, arrayBuffer, this._handle.slice(32, 64))
      return serialized
    }

    return JSON.parse(new TextDecoder().decode(res.data)) as FileMeta
  }

  _beforeDelete?: (o: IFileSystemObject) => Promise<void>
  _afterDelete?: (o: IFileSystemObject) => Promise<void>

  async delete() {
    if (!this._handle && !this._location) {
      console.warn('filesystem object already deleted')

      return
    }

    if (this._beforeDelete) {
      await this._beforeDelete(this)
    }

    if (this._handle) {
      const fileID = this._handle.slice(0, 32)

      const payload = await getPayload({
        crypto: this.config.crypto,
        payload: { fileID: bytesToHex(fileID) },
      })

      const res = await fetch(this.config.storageNode + '/api/v1/delete', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const data = await res.text()

      if (res.status !== 200) {
        throw new FileSystemObjectDeletionError(bytesToHex(fileID), data)
      }

      if (this._afterDelete) {
        await this._afterDelete(this)
      }

      // clear sensitive data
      delete this._handle
    }

    if (this._location) {
      const fileID = this._location.slice(0, 32)

      const payload = await getPayload({
        crypto: this.config.crypto,
        payload: { fileID: bytesToHex(fileID) },
      })

      const res = await fetch(this.config.storageNode + '/api/v1/delete', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const data = await res.text()

      if (res.status !== 200) {
        throw new FileSystemObjectDeletionError(bytesToHex(fileID), data)
      }

      if (this._afterDelete) {
        await this._afterDelete(this)
      }

      // clear sensitive data
      delete this._location
    }
  }

  async deleteMultiFile(files: []) {
    const fileIDs = files.map(item => bytesToHex(item.private.handle.slice(0, 32)))

    const payload = await getPayload({
      crypto: this.config.crypto,
      payload: { fileIDs },
    })

    const res = await fetch(this.config.storageNode + '/api/v2/delete', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const data = await res.text()

    if (res.status !== 200) {
      throw new FileSystemObjectDeletionError('file ids', data)
    }
  }

  async size(): Promise<number> {
    const dl = await this._getDownloadURL()

    const res = await fetch(dl + '/file', {
      method: 'HEAD',
    })

    if (!res.ok) {
      throw new Error('failed to HEAD file')
    }

    const size = res.headers.get('content-length')

    if (!size) {
      throw new Error('failed to get file size')
    }

    return +size
  }

  _beforeConvertToPublic?: (o: IFileSystemObject) => Promise<void>
  _afterConvertToPublic?: (o: IFileSystemObject) => Promise<void>

  async convertToPublic(): Promise<void> {
    if (this._location) {
      throw new FileSystemObjectConvertPublicError('file is already public')
    }

    if (!this._handle) {
      throw new FileSystemObjectConvertPublicError('file has no private source')
    }

    if (this._beforeConvertToPublic) {
      await this._beforeConvertToPublic(this)
    }

    const payload = await getPayload<PrivateToPublicObj>({
      crypto: this.config.crypto,
      payload: {
        fileHandle: bytesToHex(this._handle),
        fileSize: this._fileSize,
      },
    })

    await fetch(this.config.storageNode + '/api/v2/public-share/convert', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (this._afterConvertToPublic) {
      await this._afterConvertToPublic(this)
    }

    this._location = this._handle.slice(0, 32)
    this._handle = undefined
  }
}
