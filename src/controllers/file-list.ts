import { hex, FileMetadata, FoldersIndexEntry, FolderMetadata, FolderFileEntry } from 'opacity-library'
import { MetaController } from './meta'
import { getDirNameFromPath } from '@utils'
import isEmpty from 'lodash/isEmpty'

export type FileFolderInfo = {
  location: string
  path: string
  name: string
  uri: string
  isDir: boolean
  modified?: number
  size?: number
  type?: string
  uploaded?: number
  filesCount?: number
  isSharedPublic?: boolean
  isSharedPrivate?: boolean
  privateHandle?: string
}

export class FileListController {
  static async getFileMetaData(fileLocationBytes: Uint8Array): Promise<FileMetadata> {
    return await MetaController.accountSystem.getFileMetadata(fileLocationBytes)
  }

  static async getFolderMetaData(path: string): Promise<FolderMetadata> {
    return await MetaController.accountSystem.getFolderMetadataByPath(path)
  }

  static mapFile(path, file: FolderFileEntry): FileFolderInfo {
    /**
     * fetching file data is a 2 step process
     * step: 1 => mapFile => fetching the "crucial information ie the information which can be extracted out of the file object directly"
     * step 2 => mapFileMetaData -> here we fetch the meta data related to the file explicity and then merge it with step 1 data already sorted in fileMap
     */
    const { location, name } = file
    const hexLocation = hex.bytesToHex(location)
    return {
      location: hexLocation,
      uri: hexLocation,
      path,
      name,
      isDir: false,
    }
  }

  static async mapFileMetaData(path, file: FileFolderInfo): Promise<FileFolderInfo> {
    let isSharedPrivate = false
    const { location, name, uri, isDir } = file

    const { modified, size, type, uploaded, ...data } = await FileListController.getFileMetaData(
      hex.hexToBytes(location),
    )
    const isSharedPublic = !!data.public.shortLinks[0] || !isEmpty(data.public.location)
    if (data.private.handle && !isSharedPublic) {
      const shares = await MetaController.accountSystem.getSharesByHandle(data.private.handle)
      isSharedPrivate = shares.length > 0
    }
    return {
      location,
      path,
      name,
      uri,
      isDir,
      modified,
      size,
      type,
      uploaded,
      isSharedPublic,
      isSharedPrivate,
      privateHandle: hex.bytesToHex(data.private.handle),
    }
  }

  static mapFileComplete(path, file: FolderFileEntry): Promise<FileFolderInfo> {
    const fileFolderInfo = FileListController.mapFile(path, file)
    return FileListController.mapFileMetaData(path, fileFolderInfo)
  }

  static mapFolder(folder: FoldersIndexEntry): FileFolderInfo {
    /**
     * fetching folder data is a 2 step process
     * step: 1 => mapFolder => fetching the "crucial information ie the information which can be extracted out of the folder object directly"
     * step 2 => mapFolderMetaData -> here we fetch the meta data related to the folder explicity and then merge it with step 1 data already sorted in fileMap
     */
    const { location, path } = folder
    const name = getDirNameFromPath(path)
    return {
      location: hex.bytesToHex(location),
      path,
      name,
      uri: name,
      isDir: true,
    }
  }

  static async mapFolderMetaData(folder: FileFolderInfo): Promise<FileFolderInfo> {
    const { location, path, name, uri, isDir } = folder
    const { modified, uploaded, size, files } = await FileListController.getFolderMetaData(path)
    return {
      location,
      path,
      name,
      uri,
      isDir,
      modified,
      uploaded,
      size,
      filesCount: files.length,
    }
  }

  static mapFolderComplete(folder: FoldersIndexEntry): Promise<FileFolderInfo> {
    const fileFolderInfo = FileListController.mapFolder(folder)
    return FileListController.mapFolderMetaData(fileFolderInfo)
  }

  static async fetchFoldersAndFilesList(path) {
    const accountSystem = MetaController.accountSystem
    const [folders, folderMetadata]: [FoldersIndexEntry[], FolderMetadata] = await Promise.all([
      accountSystem.getFoldersInFolderByPath(path),
      path === '/' ? accountSystem.addFolder(path) : accountSystem.getFolderMetadataByPath(path),
    ])
    const mapFile = file => FileListController.mapFile(path, file)

    const foldersList = folders.map(FileListController.mapFolder)
    const filesList = folderMetadata.files.map(mapFile)
    const data = [...foldersList, ...filesList]
    return data.filter(file => file)
  }

  static async createFolder(folderPath, folderName) {
    const accountSystem = MetaController.accountSystem
    const slash = folderPath[folderPath.length - 1] === '/' ? '' : '/'
    const folder: FolderMetadata = await accountSystem.addFolder(`${folderPath}${slash}${folderName}`)
    return FileListController.mapFolderComplete(folder)
  }

  static async getRootLocation() {
    const accountSystem = MetaController.accountSystem
    const files = await accountSystem.addFolder('/')
    return hex.bytesToHex(files.location)
  }
}
