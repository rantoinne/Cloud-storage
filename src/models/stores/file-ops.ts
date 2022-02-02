import { Instance, SnapshotIn, types, applySnapshot, getSnapshot, getRoot, destroy, getParent } from 'mobx-state-tree'
import { FileModel, FileModelType, SharingModelType } from './models'
import { getDirNameFromPath, getPrevPath, groupListByPropPath } from '@utils'
import { FileOpsController } from '@controllers'
import { RootStore } from '@models'
import { translate } from '@i18n'

function refMapToList<T>(refMap) {
  return Array.from(refMap, ([, el]) => getSnapshot<T>(el))
}

const fileOpsInitialLoadingError = {
  _observedFileShareRef: undefined,
  fileMapSelectedRefs: {},
  loadingOpDelete: false,
  errorOpDelete: null,
}

const fileOpsInitial: FileOpsSnapshotInType = {
  ...fileOpsInitialLoadingError,
}

/**
 * FileOps store model.
 */
export const FileOpsModel = types
  .model('FileOps')
  .props({
    loadingOpDelete: false,
    loadingOpMove: false,
    successOpDelete: types.maybeNull(types.string),
    errorOpDelete: types.maybeNull(types.string),
    errorOpMove: types.maybeNull(types.string),
    fileMapSelectedRefs: types.map(types.reference(FileModel)),
    _observedFileShareRef: types.maybe(types.reference(FileModel)),
  })
  .views(self => ({
    get selectedFilesCount(): number {
      return self.fileMapSelectedRefs.size
    },
    get observedFileShare(): SharingModelType {
      try {
        if (!self._observedFileShareRef) return undefined
        return getSnapshot(self._observedFileShareRef?.sharing) as SharingModelType
      } catch (_) {
        self._observedFileShareRef = undefined
        return undefined
      }
    },
  }))
  .actions(self => ({
    setOpDeleteStatus(loading, error?: string, success?: string) {
      self.loadingOpDelete = loading
      if (error) {
        self.errorOpDelete = error
      } else if (success) {
        self.successOpDelete = loading ? null : success
      }
    },
    setOpMovingStatus(loading, error?) {
      self.loadingOpMove = loading
      if (!error) {
        self.errorOpMove = error
      }
    },
    setObservedFileShare(val?: string) {
      self._observedFileShareRef = val
    },
    observeFileShare(file: FileModelType) {
      if (self._observedFileShareRef) {
        if (file.uri !== self._observedFileShareRef.uri) {
          this.setObservedFileShare(file.uri)
        }
      } else this.setObservedFileShare(file.uri)
    },
    setFileSelected(file: FileModelType, isSelected = true) {
      if (!file.isDir) {
        file.setSelected(isSelected)
        if (isSelected) {
          self.fileMapSelectedRefs.set(file.uri, file.uri)
        } else self.fileMapSelectedRefs.delete(file.uri)
      }
    },
    discardAllSelected() {
      self.fileMapSelectedRefs.forEach((file: FileModelType) => file.setSelected(false))
      try {
        destroy(self.fileMapSelectedRefs)
      } catch (error) {
        console.log('error destroying file map refs')
      }
    },
    selectAllFiles(path: string) {
      const fileListStore = getRoot<RootStore>(self).fileListStore
      const fileList = fileListStore.getFileMapByPath(path)
      fileList.forEach((file: FileModelType) => {
        if (!file.isDir) {
          file.setSelected(true)
          self.fileMapSelectedRefs.set(file.uri, file.uri)
        }
      })
    },
    async deleteAllSelected() {
      if (self.loadingOpDelete) return
      const fileListStore = getRoot<RootStore>(self).fileListStore
      try {
        this.setOpDeleteStatus(true)
        const fileList: FileModelType[] = refMapToList<FileModelType>(self.fileMapSelectedRefs)
        await FileOpsController.deleteFileList(fileList)
        this.discardAllSelected()
        const groupedFilesByPath = groupListByPropPath<FileModelType>(fileList)
        Object.entries(groupedFilesByPath).forEach(([path, files]) => {
          fileListStore.setFetchMetadataStatus(path, true)
          fileListStore.removeFilesInMap(path, files)
          fileListStore.setFetchMetadataStatus(path, false)
        })
        this.setOpDeleteStatus(false, null, translate('remove_files:success_remove_files'))
      } catch (error) {
        const formattedError = translate('remove_files:error_delete_files')
        this.setOpDeleteStatus(false, formattedError)
      }
    },
    async moveAllSelectedFiles(newPath: string) {
      if (self.loadingOpMove) return
      const fileList: FileModelType[] = refMapToList<FileModelType>(self.fileMapSelectedRefs)
      const fileListStore = getParent<RootStore>(self).fileListStore
      try {
        this.setOpMovingStatus(true)
        await FileOpsController.moveFiles(newPath, fileList)
        this.discardAllSelected()
        const groupedFilesByPath = groupListByPropPath<FileModelType>(fileList)
        Object.entries(groupedFilesByPath).forEach(([oldPath, files]) => {
          fileListStore.fetchDirMetadata(newPath)
          fileListStore.setFetchMetadataStatus(newPath, true)
          fileListStore.moveFilesInMap(oldPath, newPath, files)
          fileListStore.setFetchMetadataStatus(newPath, false)
        })
        this.setOpMovingStatus(false)
      } catch (error) {
        this.setOpMovingStatus(false, error)
      }
    },
  }))
  .actions(self => ({
    getSelectedFiles(): FileModelType[] {
      return refMapToList<FileModelType>(self.fileMapSelectedRefs)
    },
    updateDirectoryFileCount({ destDir, isIncrement }: { destDir: string; isIncrement: boolean }) {
      if (destDir !== '/') {
        const prevFileMap = getRoot<RootStore>(self).fileListStore.getFileMapByPath(getPrevPath(destDir))
        const folderMapToBeUpdated = prevFileMap.get(getDirNameFromPath(destDir))
        folderMapToBeUpdated.updateKey(
          'filesCount',
          isIncrement ? folderMapToBeUpdated.filesCount + 1 : folderMapToBeUpdated.filesCount - 1,
        )
      }
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.setObservedFileShare()
      self.discardAllSelected()
      applySnapshot(self, fileOpsInitialLoadingError)
    },
    reset() {
      self.setObservedFileShare()
      self.discardAllSelected()
      applySnapshot(self, fileOpsInitial)
    },
    resetAllFileOpsHandlerStates() {
      self.loadingOpDelete = false
      self.errorOpDelete = null
      self.successOpDelete = null
    },
  }))

export type FileOpsType = Instance<typeof FileOpsModel>
type FileOpsSnapshotInType = SnapshotIn<typeof FileOpsModel>
export const createFileOpsDefaultModel = () => types.optional(FileOpsModel, fileOpsInitial)
