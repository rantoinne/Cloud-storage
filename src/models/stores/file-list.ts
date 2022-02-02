import { Instance, SnapshotIn, types, applySnapshot, detach, getParent } from 'mobx-state-tree'
import { FileModel, FileModelType, FileMapModelType, FileMapModel } from './models'
import { FileListController, FileSharingController, FileFolderInfo } from '@controllers'
import { refMapKeysToList, sortByProperty } from '@utils'
import { RootStore } from '@models'
import { translate } from '@i18n'
import { showToast } from '@components'

const SortByModel = types.enumeration(['name_uppercase', 'type', 'size', 'uploaded'])
const SortByOrderModel = types.enumeration(['asc', 'desc'])
export type SortByType = Instance<typeof SortByModel>
export type SortByOrderType = Instance<typeof SortByOrderModel>

const ShareStatusModel = types.model({
  loading: true,
  error: types.maybeNull(types.string),
  link: types.maybe(types.string),
})
export type ShareStatusType = Instance<typeof ShareStatusModel>

const fileStoreInitial: FileStoreSnapshotInType = {
  sortBy: undefined,
  initialLoading: false,
  fetchMetadataLastEpoch: undefined,
}

/**
 * FileList store model.
 */
export const FileStoreModel = types
  .model('FileStore')
  .props({
    root: types.optional(FileModel, {
      name: 'root',
      path: '/',
      uri: '/',
      isDir: true,
      fileMap: FileMapModel.create() as FileMapModelType,
    }) as FileModelType,
    sortBy: types.optional(SortByModel, 'uploaded'),
    sortByOrder: types.optional(SortByOrderModel, 'desc'),
    fetchMetadataLastEpoch: types.maybe(types.number),
    initialLoading: false,
    fetchFileMetaDataLoading: false,
  })
  .actions(self => ({
    setSortBy(val) {
      self.sortBy = val
    },
    setSortByOrder(val) {
      self.sortByOrder = val
    },
    setInitialLoading(loading) {
      self.initialLoading = loading
    },
    setFetchFileMetaDataLoading(loading) {
      self.fetchFileMetaDataLoading = loading
    },
    getFileMapByPath(path) {
      return self.root.getFileMap(path)
    },
  }))
  .views(self => ({
    getFileList(path, starred = false, sortBy?: SortByType, sortOrder?: SortByOrderType): FileModelType[] {
      if (self.initialLoading) return []
      const dirInfoMap = self.root.getFileMap(path)
      if (!dirInfoMap || dirInfoMap.size === 0) return []
      const fileList = Array.from(dirInfoMap.values())
      let sortingBy = self.sortBy
      let sortingOrder = self.sortByOrder
      if (sortBy) sortingBy = sortBy
      if (sortingBy === self.sortBy && sortBy) sortingOrder = sortingOrder === 'asc' ? 'desc' : 'asc'
      if (sortOrder) sortingOrder = sortOrder
      self.setSortBy(sortingBy)
      self.setSortByOrder(sortingOrder)
      return fileList.sort(sortByProperty(sortingBy, sortingOrder))
    },
    getFetchMetadataStatus(path): { fetchMetadataLoading: boolean; fetchMetadataError: string } {
      const { loading, error } = self.root.getDirStatus(path)
      return { fetchMetadataLoading: loading, fetchMetadataError: error }
    },
  }))
  .actions(self => ({
    setMetadataLastEpoch(newEpoch) {
      self.fetchMetadataLastEpoch = newEpoch
    },
    addNewDirectory(path, dirInfo) {
      const fileMap: FileMapModelType = self.root.getFileMap(path)
      if (fileMap.has(dirInfo.uri)) {
        const localDir = fileMap.get(dirInfo.uri)
        if (localDir.location === dirInfo.location) {
          return showToast('error', translate('error:folder_already_exists'))
        }
      }
      fileMap.set(dirInfo.uri, dirInfo)
    },
    deleteFile(fileMap: FileMapModelType, fileUri) {
      const detachedFileMap = detach(fileMap.get(fileUri))
      fileMap.delete(fileUri)
      return detachedFileMap
    },
    setFilesInMap(path, files: FileModelType[]) {
      const fileMap: FileMapModelType = self.root.getFileMap(path)
      const newMapData = files.reduce((acc, file) => {
        acc[file.uri] = file
        return acc
      }, {})

      /* Update files not already existing in local */
      Object.entries(newMapData).forEach(([uriKey, file]) => {
        const oldFile = fileMap.get(uriKey)
        if (oldFile) {
          oldFile.updateDetails(file)
          delete newMapData[uriKey]
        }
      })
      /* Merge all new files */
      fileMap.merge(newMapData)
    },
    setAndDiscardFilesInMap(path, files: FileModelType[]) {
      const fileMap: FileMapModelType = self.root.getFileMap(path)
      const newMapData = files.reduce((acc, file) => {
        acc[file.uri] = file
        return acc
      }, {})
      Object.entries(newMapData).forEach(([uriKey, file]) => {
        const oldFile = fileMap.get(uriKey)
        if (oldFile) {
          oldFile.updateDetails(file)
        }
      })
      if (fileMap.size) {
        refMapKeysToList(fileMap).forEach(uriKey => {
          if (newMapData[uriKey]) {
            delete newMapData[uriKey]
          } else {
            this.deleteFile(fileMap, uriKey)
          }
        })
      }
      fileMap.merge(newMapData)
    },
    removeFilesInMap(path, filesToRemove: FileModelType[]) {
      try {
        this.setFetchMetadataStatus(path, true)
        const fileMap: FileMapModelType = self.root.getFileMap(path)
        filesToRemove.forEach(({ uri }) => this.deleteFile(fileMap, uri))
      } finally {
        this.setFetchMetadataStatus(path, false)
      }
    },
    moveFilesInMap(oldPath: string, newPath: string, filesToMove: FileModelType[]) {
      const oldFileMap: FileMapModelType = self.root.getFileMap(oldPath)
      const fileOpsStore = getParent<RootStore>(self).fileOpsStore
      filesToMove.forEach(file => {
        const fileMap = this.deleteFile(oldFileMap, file.uri)
        const newFileMap: FileMapModelType = self.root.getFileMap(newPath)
        fileMap.updateDetails(file, newPath)
        newFileMap.set(file.uri, fileMap)
        fileOpsStore.updateDirectoryFileCount({
          destDir: oldPath,
          isIncrement: false,
        })
        fileOpsStore.updateDirectoryFileCount({
          destDir: newPath,
          isIncrement: true,
        })
      })
    },
    replaceFileInMap(path, oldFile: FileModelType, file: FileModelType) {
      try {
        this.setFetchMetadataStatus(path, true)
        const fileMap: FileMapModelType = self.root.getFileMap(path)
        fileMap.get(oldFile.uri).updateDetails(file)
      } finally {
        this.setFetchMetadataStatus(path, false)
      }
    },
    setRootLocation(location) {
      self.root.location = location
    },
    setFetchMetadataStatus(path, loading, error?) {
      // Exception case for root only, UI related
      if (path === '/') {
        // first time to load files, fetchMetadataLastEpoch is not set yet
        if (self.fetchMetadataLastEpoch === undefined) {
          self.setInitialLoading(true)
        } else {
          // otherwise only set if loading is false
          if (self.initialLoading && !loading) {
            self.setInitialLoading(false)
            getParent<RootStore>(self).uploaderStore.autoSync.startAutoSync()
          }
        }
      }
      // update directory loading & error status
      self.root.setDirStatus(path, loading, error)
      this.setMetadataLastEpoch(new Date().getTime())
    },
  }))
  .actions(self => ({
    async getPublicShareLink(fileLocation: string) {
      const result = await FileSharingController.getPublicFileShare(fileLocation)
      const splitLink = result.split('/')
      const link = splitLink[splitLink.length - 1]
      return link
    },
    async createFolder(path, dirName) {
      try {
        self.setFetchMetadataStatus(path, true)
        const dirInfo = await FileListController.createFolder(path, dirName)
        self.addNewDirectory(path, dirInfo)
        self.setFetchMetadataStatus(path, false)
      } catch (error) {
        self.setFetchMetadataStatus(path, false, error.message)
      }
    },
    async fetchDirMetadata(path) {
      if (self.getFetchMetadataStatus(path).fetchMetadataLoading) return
      try {
        self.setFetchMetadataStatus(path, true)
        /* Get metadata for current path */
        const foldersAndfiles = await FileListController.fetchFoldersAndFilesList(path)
        /* update files in path directory map */
        self.setAndDiscardFilesInMap(path, foldersAndfiles)
        self.setFetchMetadataStatus(path, false)
      } catch (error) {
        self.setFetchMetadataStatus(path, false, JSON.stringify(error))
      }
    },
    async fetchFileMetaData(path, file: FileFolderInfo) {
      try {
        self.setFetchFileMetaDataLoading(true)
        const fileMetaData = await FileListController.mapFileMetaData(path, file)
        self.setFilesInMap(path, [fileMetaData])
      } catch (error) {
      } finally {
        self.setFetchFileMetaDataLoading(false)
      }
    },
    async fetchFolderMetaData(path, folder: FileFolderInfo) {
      try {
        const folderMetaData = await FileListController.mapFolderMetaData(folder)
        self.setFilesInMap(path, [folderMetaData])
      } catch (error) {}
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.root.resetAllDirStatus()
    },
    reset() {
      self.root.fileMap.clear()
      applySnapshot(self, fileStoreInitial)
    },
  }))

export type FileStoreType = Instance<typeof FileStoreModel>
type FileStoreSnapshotInType = SnapshotIn<typeof FileStoreModel>
export const createFileStoreDefaultModel = () => types.optional(FileStoreModel, fileStoreInitial)
