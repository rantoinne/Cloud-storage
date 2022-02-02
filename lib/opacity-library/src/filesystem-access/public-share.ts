import { bytesToHex } from '../util/hex'
import { CryptoMiddleware } from '../interfaces/CryptoMiddleware'
import { getPayload } from '../util/payload'

export interface IFileSystemShare {
  readonly shortlink?: string
  readonly fileLocation?: Uint8Array

  _beforePublicShare?: (s: IFileSystemShare, fileLocation: Uint8Array, publicShare: PublicShareArgs) => Promise<void>
  _afterPublicShare?: (
    s: IFileSystemShare,
    fileLocation: Uint8Array,
    handle: Uint8Array,
    publicShare: PublicShareArgs,
    shortLink: string,
  ) => Promise<void>
  publicShare(publicShare: PublicShareArgs): Promise<string>

  _beforePublicShareRevoke?: (s: IFileSystemShare, fileLocation: Uint8Array, shortLink: string) => Promise<void>
  _afterPublicShareRevoke?: (
    s: IFileSystemShare,
    fileLocation: Uint8Array,
    handle: Uint8Array,
    shortLink: string,
  ) => Promise<void>
  publicShareRevoke(): Promise<void>
}

export class FileSystemShareCreateShortlinkError extends Error {
  constructor(err: string) {
    super(`CreateShortlinkError: Failed to share file. Recieved: ${err}`)
  }
}

export class FileSystemShareRevokeShortlinkError extends Error {
  constructor(err: string) {
    super(`RevokeShortlinkError: Failed to revoke shared file. Recieved: ${err}`)
  }
}

export class FileSystemShareMissingDataError extends Error {
  constructor(type: string) {
    super(`MissingDataError: Missing ${type} from share properties`)
  }
}

type PublicShareArgs = {
  title: string
  description: string
  mimeType: string
  fileExtension: string
}

type CreateShortlinkObj = {
  file_id: string
  title: string
  mimeType: string
  fileExtension: string
  description: string
}

type CreateShortlinkResp = {
  short_id: string
}

type ShortlinkFileResp = {
  s3_url: string
  s3_thumbnail_url: string
}

type PublicShareObj = {
  shortlink: string
}

type PublicShareRevokeRes = {
  status: 'Public share revoked'
}

export type FileSystemShareConfig = {
  crypto: CryptoMiddleware
  storageNode: string
}

export type FileSystemShareArgs = {
  shortLink?: string
  fileLocation?: Uint8Array
  handle?: Uint8Array

  config: FileSystemShareConfig
}

export class FileSystemShare implements IFileSystemShare {
  _shortlink?: string

  get shortlink() {
    return this._shortlink
  }

  _fileLocation?: Uint8Array

  get fileLocation() {
    return this._fileLocation
  }

  _handle?: Uint8Array

  get handle() {
    return this._handle
  }

  config: FileSystemShareConfig

  constructor({ shortLink, handle, fileLocation, config }: FileSystemShareArgs) {
    this._shortlink = shortLink
    this._fileLocation = fileLocation
    this._handle = handle

    this.config = config
  }

  _beforePublicShare?: (s: IFileSystemShare, fileLocation: Uint8Array, publicShare: PublicShareArgs) => Promise<void>
  _afterPublicShare?: (
    s: IFileSystemShare,
    fileLocation: Uint8Array,
    handle: Uint8Array,
    publicShare: PublicShareArgs,
    shortLink: string,
  ) => Promise<void>

  async publicShare(publicShare: PublicShareArgs): Promise<string> {
    if (this._shortlink) {
      return this._shortlink
    }

    if (!this._fileLocation) {
      throw new FileSystemShareMissingDataError('file location')
    }

    if (this._beforePublicShare) {
      await this._beforePublicShare(this, this._fileLocation, publicShare)
    }

    const payload = await getPayload<CreateShortlinkObj>({
      crypto: this.config.crypto,
      payload: {
        file_id: bytesToHex(this._fileLocation),
        title: publicShare.title,
        description: publicShare.description,
        fileExtension: publicShare.fileExtension,
        mimeType: publicShare.mimeType,
      },
    })

    const res = await fetch(this.config.storageNode + '/api/v2/public-share/shortlink', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new FileSystemShareCreateShortlinkError(data.toString())
    }

    if (this._afterPublicShare) {
      await this._afterPublicShare(this, this._fileLocation, this._handle, publicShare, data.short_id)
    }

    console.log('after public share')

    this._shortlink = data.short_id

    return data.short_id
  }

  _beforePublicShareRevoke?: (s: IFileSystemShare, fileLocation: Uint8Array, shortLink: string) => Promise<void>
  _afterPublicShareRevoke?: (
    s: IFileSystemShare,
    fileLocation: Uint8Array,
    handle: Uint8Array,
    shortLink: string,
  ) => Promise<void>

  async publicShareRevoke(): Promise<void> {
    if (!this._shortlink) {
      throw new FileSystemShareMissingDataError('shortlink')
    }

    if (!this._fileLocation) {
      throw new FileSystemShareMissingDataError('file location')
    }

    if (this._beforePublicShareRevoke) {
      await this._beforePublicShareRevoke(this, this._fileLocation, this._shortlink)
    }

    const payload = await getPayload<PublicShareObj>({
      crypto: this.config.crypto,
      payload: {
        shortlink: this._shortlink,
      },
    })

    const res = await fetch(this.config.storageNode + '/api/v2/public-share/revoke', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new FileSystemShareRevokeShortlinkError(data.toString())
    }

    if (this._afterPublicShareRevoke) {
      await this._afterPublicShareRevoke(this, this._fileLocation, this._handle, this._shortlink)
    }

    this._shortlink = undefined
  }
}
