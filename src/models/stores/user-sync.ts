import { showToast } from '@components'
import { applySnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { QueueModel, FileUploadStatusType, FileUploadType } from './models'

export const userSyncInitial: UserSyncSnapshotInType = {}

/**
 * UserSync store model.
 */
export const UserSyncStoreModel = types
  .model('UserSyncStore')
  .props({
    queue: types.optional(QueueModel, {}),
  })
  .views(self => ({
    get failCount() {
      return self.queue.failCount
    },
    get size() {
      return self.queue.size
    },
    get successCount() {
      return self.queue.successCount
    },
  }))
  .actions(self => ({
    updateFileStatus(file: FileUploadType, status: FileUploadStatusType) {
      self.queue.updateFileStatus(file, status)
    },
    uploadFileList(fileList: FileUploadType[], destDir: string) {
      const uploadFile = (file: FileUploadType) => {
        const fileStatus = self.queue.getStatus(file)
        switch (fileStatus) {
          case 'failed':
            return self.queue.retryFailed(file)
          case 'uploading':
            return showToast('info', 'File is already uploading!')
          default: {
            file.destDir = destDir
            self.queue.set(file.path, file)
          }
        }
      }
      fileList.forEach(uploadFile)
    },
    async dismissFile(file: FileUploadType) {
      self.queue.dismissFile(file)
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.queue.resetLoadingErrorFailAll()
    },
    reset() {
      self.queue.reset()
      applySnapshot(self, userSyncInitial)
    },
  }))

export type UserSyncStoreType = Instance<typeof UserSyncStoreModel>
type UserSyncSnapshotInType = SnapshotIn<typeof UserSyncStoreModel>
export const createUserSyncStoreDefaultModel = () => types.optional(UserSyncStoreModel, userSyncInitial)
