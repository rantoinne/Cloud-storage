import { applySnapshot, Instance, SnapshotIn, types, getParent } from 'mobx-state-tree'
import { FileUploader } from '@controllers'
import { FileModelType, FileUploadType, FileUploadStatusType } from './models'
import { UserSyncStoreModel, userSyncInitial } from './user-sync'
import { AutoSyncStoreModel, autoSyncInitial } from './auto-sync'
import { RootStore } from '@models/root-store/root-store'

const uploaderInitial: UploaderSnapshotInType = {
  dismissAllBackedUp: true,
}

/**
 * Uploader store model.
 */
export const UploaderStoreModel = types
  .model('UploaderStore')
  .props({
    userSync: types.optional(UserSyncStoreModel, userSyncInitial),
    autoSync: types.optional(AutoSyncStoreModel, autoSyncInitial),
    dismissAllBackedUp: types.optional(types.boolean, true),
  })
  .views(self => ({
    // use shadow size for autoSync, to show user that all files are being uploaded
    get totalCount() {
      return self.userSync.size + self.autoSync.shadowSize
    },
    get uploadFailCount() {
      return self.userSync.failCount + self.autoSync.failCount
    },
    get currentlyUploadingCount() {
      return this.totalCount - this.uploadFailCount
    },
    get uploadSuccessCount() {
      return self.userSync.successCount + self.autoSync.successCount
    },
    get isAllBackedUp() {
      return !self.dismissAllBackedUp && this.totalCount === 0
    },
    get observedFile() {
      return self.userSync.queue.observedFile || self.autoSync.queue.observedFile
    },
  }))
  .actions(self => ({
    uploadFileList(fileList: FileUploadType[], destDir = '/') {
      // for user add files only
      self.userSync.uploadFileList(fileList, destDir)
      this.startUploading()
    },
    setDismissAllBackedUp(clear = true, fromUserIntent: boolean) {
      self.dismissAllBackedUp = clear
      if (fromUserIntent) {
        getParent<RootStore>(self).authStore.updateUser()
      }
      if (clear) {
        self.userSync.queue.clearSuccessful()
        self.autoSync.queue.clearSuccessful()
      }
    },
    dismissAllFailed() {
      self.userSync.queue.dismissAllFailed()
      self.autoSync.queue.dismissAllFailed()
    },
    async retryAllFailed() {
      await self.userSync.queue.retryAllFailed()
      await self.autoSync.queue.retryAllFailed()
      this.startUploading()
    },
    updateFileStatus(file: FileUploadType, status: FileUploadStatusType) {
      if (file.isAutoSync) {
        self.autoSync.updateFileStatus(file, status)
      } else self.userSync.updateFileStatus(file, status)
    },
    getNextFileToUpload(): FileUploadType {
      /* IMPORTANT: (user)Sync queue is checked first, because user uploads have a higher priority */
      let nextFile: FileUploadType = self.userSync.queue.getNextToUpload()
      if (!nextFile) {
        nextFile = self.autoSync.queue.getNextToUpload()
      }
      if (nextFile) this.setDismissAllBackedUp(false, false)
      return nextFile
    },
    startUploading() {
      if (self.observedFile) return
      const fileToUpload: FileUploadType = this.getNextFileToUpload()
      if (!fileToUpload) return
      this.updateFileStatus(fileToUpload, 'in-progress')
      /* on Progress callback */
      const onProgress = (status: FileUploadStatusType, progress = 0) => {
        fileToUpload.updateStatus(status, progress)
        if (status === 'success' || status === 'failed') {
          this.updateFileStatus(fileToUpload, status)
          getParent<RootStore>(self).fileOpsStore.updateDirectoryFileCount({
            destDir: fileToUpload.destDir,
            isIncrement: status === 'success',
          })
          this.startUploading()
        }
      }
      /* start uploading */
      FileUploader.uploadFile(fileToUpload, onProgress)
    },
    async retryFailed(file: FileModelType) {
      if (file.isAutoSync) {
        await self.autoSync.queue.retryFailed(file)
      } else await self.userSync.queue.retryFailed(file)
      this.startUploading()
    },
    clearSuccessful() {
      self.userSync.queue.clearSuccessful()
      self.autoSync.queue.clearSuccessful()
    },
    dismissAllNeedUpload() {
      self.userSync.queue.dismissAllNeedUpload()
      self.autoSync.queue.dismissAllNeedUpload()
    },
    async dismissInProgress() {
      if (self.observedFile) {
        FileUploader.removeFromQueue(self.observedFile.path, true)
        if (self.observedFile.isAutoSync) {
          self.autoSync.queue.dismissInProgress()
        } else self.userSync.queue.dismissInProgress()
      }
      this.startUploading()
    },
    dismissFile(file: FileModelType) {
      if (file.status === 'in-progress') {
        this.dismissInProgress()
      } else {
        if (file.isAutoSync) {
          self.autoSync.dismissFile(file)
        } else self.userSync.dismissFile(file)
        this.startUploading()
      }
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.autoSync.resetLoadingError()
      self.userSync.resetLoadingError()
      self.startUploading()
    },
    reset() {
      self.autoSync.reset()
      self.userSync.reset()
      applySnapshot(self, uploaderInitial)
    },
  }))

export type UploaderStoreType = Instance<typeof UploaderStoreModel>
type UploaderSnapshotInType = SnapshotIn<typeof UploaderStoreModel>
export const createUploaderStoreDefaultModel = () => types.optional(UploaderStoreModel, uploaderInitial)
