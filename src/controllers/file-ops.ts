import {
  hex,
  FolderMetadata,
  FileSystemObject,
  bindFileSystemObjectToAccountSystem,
  FoldersIndexEntry,
} from 'opacity-library'
import { MetaController } from '@controllers/meta'
import { FileListController } from '@controllers/file-list'

export class FileOpsController {
  static async renameFolder(folderPath, currentFolderName, newFolderName) {
    const accountSystem = MetaController.accountSystem
    const slash = folderPath[folderPath.length - 1] === '/' ? '' : '/'
    const folder: FolderMetadata = await accountSystem.renameFolder(
      `${folderPath}${slash}${currentFolderName}`,
      newFolderName,
    )
    return FileListController.mapFolder(folder)
  }

  static async renameFile(folderPath, location, newFileName) {
    const accountSystem = MetaController.accountSystem
    const file = await accountSystem.renameFile(hex.hexToBytes(location), newFileName)
    return FileListController.mapFile(folderPath, file)
  }

  static async deleteFolder(folder: FoldersIndexEntry) {
    try {
      const accountSystem = MetaController.accountSystem
      const folders = await accountSystem.getFoldersInFolderByPath(folder.path)
      const folderMeta = await accountSystem.getFolderMetadataByPath(folder.path)

      const fileMetaListInFolder = []
      for (const file of folderMeta.files) {
        const metaFile = await accountSystem.getFileIndexEntryByFileMetadataLocation(file.location)
        fileMetaListInFolder.push(metaFile)
      }

      fileMetaListInFolder.length > 0 && (await FileOpsController.deleteFileList(fileMetaListInFolder))

      for (const folderItem of folders) {
        await FileOpsController.deleteFolder(folderItem)
      }

      await accountSystem.removeFolderByPath(folder.path)
    } catch (e) {
      console.error(e)
    }
  }

  static async deleteFile(file: any) {
    const accountSystem = MetaController.accountSystem
    const fso = new FileSystemObject({
      handle: hex.hexToBytes(file.privateHandle),
      location: undefined,
      config: MetaController.config,
    })
    bindFileSystemObjectToAccountSystem(accountSystem, fso)
    await fso.delete()
  }

  static async deleteFileList(files: any[]) {
    const currentFiles = files.map(file => {
      return {
        location: file?.private?.handle ? file.location : hex.hexToBytes(file.location),
        private: { handle: file?.private?.handle ? file.private.handle : hex.hexToBytes(file.privateHandle) },
      }
    })
    const accountSystem = MetaController.accountSystem
    const fso = new FileSystemObject({
      handle: currentFiles[0].private.handle,
      location: undefined,
      config: {
        crypto: MetaController.crypto,
        storageNode: MetaController.storageNode,
      },
    })
    bindFileSystemObjectToAccountSystem(MetaController.accountSystem, fso)
    await fso.deleteMultiFile(currentFiles as any)
    await accountSystem.removeMultiFile(currentFiles.map(item => item.location))
  }

  static async moveFiles(newPath, selectedFiles: any[]) {
    const accountSystem = MetaController.accountSystem
    for (const file of selectedFiles) {
      const payloadLocation = hex.hexToBytes(file.location)
      await accountSystem.moveFile(payloadLocation, newPath)
    }
  }
}
