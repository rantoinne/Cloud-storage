import { Instance, types, applySnapshot, getParent, SnapshotIn } from 'mobx-state-tree'
import { FileOpsController } from '@controllers'
import { RootStore } from '@models/root-store/root-store'
import { translate } from '@i18n'

const initialStateOnReset: FileHandlerSnapshotInType = {
  fileHandlerLoading: false,
  fileHandlerError: null,
  fileHandlerSuccess: null,
}

/**
 * FileHandler store model.
 */
export const FileHandlerStoreModel = types
  .model('FileHandler')
  .props({
    fileHandlerLoading: types.boolean,
    fileHandlerError: types.maybeNull(types.string),
    fileHandlerSuccess: types.maybeNull(types.string),
  })
  .actions(self => ({
    setFileHandlerStatus(loading, error?: string, success?: string) {
      self.fileHandlerLoading = loading
      if (error) {
        self.fileHandlerError = loading ? null : error
      } else if (success) {
        self.fileHandlerSuccess = loading ? null : success
      }
    },
    async renameFolder(path, targetObject, newFolderName) {
      this.resetAllFileHandlingStates()
      const { setFilesInMap, removeFilesInMap, setFetchMetadataStatus } = getParent<RootStore>(self).fileListStore
      try {
        this.setFileHandlerStatus(true)
        setFetchMetadataStatus(path, true)
        const folder = await FileOpsController.renameFolder(path, targetObject.name, newFolderName)
        setFilesInMap(path, [folder])
        removeFilesInMap(path, [targetObject])
        setFetchMetadataStatus(path, false)
        this.setFileHandlerStatus(
          false,
          null,
          translate('rename_files:success_rename_file', { name: targetObject.name }),
        )
      } catch (error) {
        setFetchMetadataStatus(path, false)
        this.setFileHandlerStatus(false, translate('rename_files:error_rename_folder'))
      }
    },
    async renameFile(path, targetObject, newFileName) {
      this.resetAllFileHandlingStates()
      const { setFetchMetadataStatus, replaceFileInMap } = getParent<RootStore>(self).fileListStore
      try {
        this.setFileHandlerStatus(true)
        setFetchMetadataStatus(path, true)
        const file = await FileOpsController.renameFile(path, targetObject.location, newFileName)
        replaceFileInMap(path, targetObject, file)
        setFetchMetadataStatus(path, false)
        this.setFileHandlerStatus(
          false,
          null,
          translate('rename_files:success_rename_file', { name: targetObject.name }),
        )
      } catch (error) {
        setFetchMetadataStatus(path, false)
        this.setFileHandlerStatus(false, translate('rename_files:error_rename_file'))
      }
    },
    async deleteFolder(path, targetObject) {
      this.resetAllFileHandlingStates()
      const { removeFilesInMap, setFetchMetadataStatus } = getParent<RootStore>(self).fileListStore
      try {
        this.setFileHandlerStatus(true)
        await FileOpsController.deleteFolder(targetObject)
        removeFilesInMap(path, [targetObject])
        setFetchMetadataStatus(path, false)
        getParent<RootStore>(self).authStore.updateUser()
        this.setFileHandlerStatus(
          false,
          null,
          translate('remove_files:success_remove_file', { name: targetObject.name }),
        )
      } catch (error) {
        setFetchMetadataStatus(path, false)
        const formattedError = translate('remove_files:error_delete_folder')
        this.setFileHandlerStatus(false, formattedError)
      }
    },
    async deleteFile(path, targetObject) {
      this.resetAllFileHandlingStates()
      const { removeFilesInMap, setFetchMetadataStatus } = getParent<RootStore>(self).fileListStore
      try {
        this.setFileHandlerStatus(true)
        setFetchMetadataStatus(path, true)
        await FileOpsController.deleteFile(targetObject)

        removeFilesInMap(path, [targetObject])
        setFetchMetadataStatus(path, false)
        getParent<RootStore>(self).authStore.updateUser()
        this.setFileHandlerStatus(
          false,
          null,
          translate('remove_files:success_remove_file', { name: targetObject.name }),
        )
      } catch (error) {
        setFetchMetadataStatus(path, false)
        this.setFileHandlerStatus(false, translate('remove_files:error_delete_file'))
      }
    },
    resetAllFileHandlingStates() {
      self.fileHandlerError = null
      self.fileHandlerSuccess = null
      self.fileHandlerLoading = false
    },
  }))
  .actions(self => ({
    async resetLoadingError() {
      self.resetAllFileHandlingStates()
    },
    reset() {
      applySnapshot(self, initialStateOnReset)
    },
  }))

export type FileHandlerType = Instance<typeof FileHandlerStoreModel>
type FileHandlerSnapshotInType = SnapshotIn<typeof FileHandlerStoreModel>
export const createFileHandlerStoreDefaultModel = () => types.optional(FileHandlerStoreModel, initialStateOnReset)
