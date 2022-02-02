import { FileMetadata } from '../account-system/AccountSystem'

export interface Downloader {
  readonly public: boolean

  getLocation(): Promise<Uint8Array>
  getEncryptionKey(): Promise<Uint8Array | undefined>

  readonly name: string

  readonly size: number | undefined
  readonly sizeOnFS: number | undefined

  getDownloadUrl(): Promise<string | undefined>
  getMetadata(): Promise<FileMetadata | undefined>

  _beforeDownload?: (d: this) => Promise<void>
  _afterDownload?: (d: this) => Promise<void>

  startDownload(): Promise<void>
}
