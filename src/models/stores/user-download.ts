import { applySnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { FileDownloadStatusType, FileDownloadType } from './models'
import { DownloadQueueModel } from './models/download-queue'

export const userDownloadInitial: UserDownloadSnapshotInType = {}

/**
 * UserSync store model.
 */
export const UserDownloadStoreModel = types
  .model('UserSyncStore')
  .props({
    queue: types.optional(DownloadQueueModel, {}),
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
    currentlyDownloading() {
      return self.queue.currentlyDownloading()
    },
    updateFileStatus(file: FileDownloadType, status: FileDownloadStatusType, path: string) {
      self.queue.updateFileStatus(file, status, path, file.name)
    },
    downloadFile(file: FileDownloadType) {
      let location = file.location
      const keysNeedDownload = Array.from(self.queue.queueMap.keys())
      const keysDownloaded = Array.from(self.queue.successMap.keys())
      const sameFileAppearancesInNeedDownload = keysNeedDownload.filter(k => k.split('-')[0] === file.location).length
      const sameFileAppearancesInSuccessfullyDownloaded = keysDownloaded.filter(k => k.split('-')[0] === file.location)
        .length
      if (sameFileAppearancesInNeedDownload > 0 || sameFileAppearancesInSuccessfullyDownloaded > 0) {
        location = `${file.location}-${
          sameFileAppearancesInNeedDownload + sameFileAppearancesInSuccessfullyDownloaded + 1
        }`
      }
      self.queue.set(location, file)
    },
    async dismissFile(file: FileDownloadType) {
      self.queue.dismissFile(file)
    },
    fileInQueueToBeDownloaded(): FileDownloadType[] {
      const statusesToIgnore = ['failed', 'cancelled']
      const queueArray = Array.from(self.queue.queueMap.values())
      const toBeDownloadedFiles = queueArray.filter(el => !statusesToIgnore.includes(el.status))
      return toBeDownloadedFiles
    },
    removeFileFromQueue(file) {
      self.queue.removeFileFromQueue(file)
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.queue.resetLoadingErrorFailAll()
    },
    reset() {
      self.queue.reset()
      applySnapshot(self, userDownloadInitial)
    },
  }))

export type UserDownloadStoreType = Instance<typeof UserDownloadStoreModel>
type UserDownloadSnapshotInType = SnapshotIn<typeof UserDownloadStoreModel>
export const createUserDownloadStoreDefaultModel = () => types.optional(UserDownloadStoreModel, userDownloadInitial)
