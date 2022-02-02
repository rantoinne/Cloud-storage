import {
  hex,
  FileSystemObject,
  FileSystemShare,
  bindFileSystemObjectToAccountSystem,
  bindPublicShareToAccountSystem,
  bytesToB64URL,
  ShareFileMetadataInit,
  FileMetadata,
} from 'opacity-library'
import { MetaController } from './meta'
import { PRIVATE_SHARE_URL, PUBLIC_SHARE_URL } from '@env'
import { getFileExtension } from '@utils'
import { translate } from '@i18n'
import isEmpty from 'lodash/isEmpty'

export class FileSharingController {
  static async getFileMetaData(fileLocation): Promise<FileMetadata> {
    return await MetaController.accountSystem.getFileMetadata(hex.hexToBytes(fileLocation))
  }

  static getFileSystemObject(fileMetaData: FileMetadata): FileSystemObject {
    return new FileSystemObject({
      handle: fileMetaData.private.handle || undefined,
      location: fileMetaData.public.location || undefined,
      config: MetaController.config,
      fileSize: fileMetaData.size,
    })
  }

  static getPublicFullLink(fileShareId: string) {
    return `${PUBLIC_SHARE_URL}/${fileShareId}`
  }

  static getPrivateFullLink(handle: string) {
    return `${PRIVATE_SHARE_URL}/share#key=${handle})}`
  }

  static async getPrivateFileShare(fileLocation: string) {
    const accountSystem = MetaController.accountSystem
    const fileMetaData = await FileSharingController.getFileMetaData(fileLocation)
    if (fileMetaData.private.handle && isEmpty(fileMetaData.public.location)) {
      const shares = await accountSystem.getSharesByHandle(fileMetaData.private.handle)
      if (shares[0]) {
        const shareHandle = bytesToB64URL(accountSystem.getShareHandle(shares[0]))
        return FileSharingController.getPrivateFullLink(shareHandle)
      }
      const shareFileMetaDataInit: ShareFileMetadataInit = { location: fileMetaData.location, path: '/' }
      const shareMeta = await accountSystem.share([shareFileMetaDataInit])
      if (!shareMeta) throw Error(translate('file_sharing:error_missing_info'))
      const shareHandle = bytesToB64URL(accountSystem.getShareHandle(shareMeta))
      return FileSharingController.getPrivateFullLink(shareHandle)
    } else {
      throw Error(translate('file_sharing:error_missing_metadata'))
    }
  }

  static async getPublicFileShare(fileLocation: string) {
    const accountSystem = MetaController.accountSystem
    const config = MetaController.config
    const fileMetaData = await FileSharingController.getFileMetaData(fileLocation)

    if (fileMetaData.public.shortLinks[0] || !isEmpty(fileMetaData.public.location)) {
      // If previously shared publicly
      return FileSharingController.getPublicFullLink(fileMetaData.public.shortLinks[0])
    }

    const fileSystemObject = FileSharingController.getFileSystemObject(fileMetaData)
    bindFileSystemObjectToAccountSystem(accountSystem, fileSystemObject)

    // Convert file to public
    await fileSystemObject.convertToPublic()
    // Initialize share object
    const fileSystemShare = new FileSystemShare({
      fileLocation: fileSystemObject.location,
      handle: fileMetaData.private.handle,
      config,
    })
    bindPublicShareToAccountSystem(accountSystem, fileSystemShare)
    // Add share file information
    const fileShareId = await fileSystemShare.publicShare({
      title: fileMetaData.name,
      description: translate('file_sharing:this_file_is_opacity'),
      fileExtension: getFileExtension(fileMetaData.name),
      mimeType: fileMetaData.type,
    })
    return FileSharingController.getPublicFullLink(fileShareId)
  }

  static async revokePublicFileShare(fileLocation: string) {
    const config = MetaController.config
    const accountSystem = MetaController.accountSystem
    const fileMetaData = await FileSharingController.getFileMetaData(fileLocation)
    const fileSystemShare = new FileSystemShare({
      shortLink: fileMetaData.public.shortLinks[0],
      fileLocation: fileMetaData.public.location,
      handle: fileMetaData.location,
      config,
    })
    bindPublicShareToAccountSystem(accountSystem, fileSystemShare)
    await fileSystemShare.publicShareRevoke()
  }
}
