import { AccountSystem, FileMetadata } from '../account-system/AccountSystem'
import { Downloader } from './downloader'
import { extractPromise } from '../util/promise'
import { IFileSystemObject } from './filesystem-object'
import { Uploader } from './uploader'
import { IFileSystemShare } from './public-share'

export const bindUploadToAccountSystem = (accountSystem: AccountSystem, u: Uploader) => {
  const [fileMetadata, resolveFileMetadata] = extractPromise<FileMetadata>()

  u._beforeUpload = async u => {
    const file = await accountSystem.addUpload(
      await u.getLocation(),
      await u.getEncryptionKey(),
      u.path,
      u.name,
      u.metadata,
      u.public,
    )

    resolveFileMetadata(file)
  }

  u._afterUpload = async () => {
    const file = await fileMetadata

    await accountSystem.finishUpload(file.location)
  }
}

export const bindDownloadToAccountSystem = (accountSystem: AccountSystem, d: Downloader) => {
  // TODO: download history
}

export const bindFileSystemObjectToAccountSystem = <T extends IFileSystemObject>(
  accountSystem: AccountSystem,
  o: T,
) => {
  // handle deletion
  o._afterDelete = async o => {
    const fileHandle = o.handle
    const fileLocation = o.location

    if (!fileHandle && !fileLocation) {
      throw new Error('filesystem object error: cannot find valid source')
    }

    const metaLocaction = fileHandle
      ? await accountSystem.getFileMetadataLocationByFileHandle(fileHandle!)
      : await accountSystem.getFileMetadataLocationByFileLocation(fileLocation!)

    await accountSystem.removeFile(metaLocaction)
  }

  o._beforeConvertToPublic = async o => {
    if (!o.handle) {
      throw new Error('filesystem object error: handle not found')
    }

    const metadataLocation = await accountSystem.getFileMetadataLocationByFileHandle(o.handle)
    await accountSystem.setFilePublicLocation(metadataLocation, o.handle.slice(0, 32))
  }

  // o._afterConvertToPublic = async (o) => {
  // 	if (!o.handle) {
  // 		throw new Error("filesystem object error: handle not found")
  // 	}

  // 	const metadataLocation = await accountSystem.getFileMetadataLocationByFileHandle(o.handle)
  // 	await accountSystem.setFilePrivateHandle(metadataLocation, null)
  // }
}

export const bindPublicShareToAccountSystem = <T extends IFileSystemShare>(accountSystem: AccountSystem, s: T) => {
  s._afterPublicShare = async (s, fileLocation, handle, share, shortlink) => {
    if (!shortlink) {
      throw new Error('public share error: cannot find shortlink')
    }

    if (!fileLocation) {
      throw new Error('public share error: no valid file location')
    }

    console.log('searching for meta location')

    const metaLocation = await accountSystem.getFileMetadataLocationByFileHandle(handle)
    // const metaLocation = await accountSystem.getFileMetadataLocationByFileLocation(fileLocation)
    console.log(metaLocation)
    await accountSystem.addFilePublicShortlink(metaLocation, shortlink)
  }

  s._afterPublicShareRevoke = async (s, fileLocation, handle, shortlink) => {
    if (!shortlink) {
      throw new Error('public share error: cannot find shortlink')
    }

    if (!fileLocation) {
      throw new Error('public share error: no valid file location')
    }

    // const metaLocation = await accountSystem.getFileMetadataLocationByFileHandle(handle)
    // const metaLocation = await accountSystem.getFileMetadataLocationByFileLocation(fileLocation)

    await accountSystem.removeFilePublicShortlink(handle, shortlink)
  }
}
