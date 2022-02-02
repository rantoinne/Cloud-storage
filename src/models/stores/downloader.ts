import { RootStore } from '@models'
import { applySnapshot, getParent, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { FileDownloader } from '@controllers'
import { UserDownloadStoreModel } from '.'
import { FileDownloadStatusType, FileDownloadType } from './models/file-download'

const downloaderInitial: DownloaderSnapshotInType = {
  dismissAllBackedUp: true,
}

/**
 * Downloader store model.
 */
export const DownloaderStoreModel = types
  .model('DownloaderStore')
  .props({
    userDownload: types.optional(UserDownloadStoreModel, {}),
    dismissAllBackedUp: types.optional(types.boolean, true),
  })
  .views(self => ({
    get totalCount() {
      return self.userDownload.queue.size
    },
    get downloadFailCount() {
      return self.userDownload.queue.failCount
    },
    get downloadCancelledCount() {
      return self.userDownload.queue.cancelledCount
    },
    get currentlyDownloadingCount() {
      return self.userDownload.queue.currentlyDownloadingCount
    },
    get downloadSuccessCount() {
      return self.userDownload.queue.successCount
    },
    get isAllBackedUp() {
      return !self.dismissAllBackedUp && this.totalCount === 0
    },
    get observedFile() {
      return self.userDownload.queue.observedFile
    },
  }))
  .actions(self => ({
    downloadFile(file: FileDownloadType) {
      self.userDownload.downloadFile(file)
      this.startDownloading()
    },
    setDismissAllBackedUp(clear = true, fromUserIntent: boolean) {
      self.dismissAllBackedUp = clear
      if (fromUserIntent) {
        getParent<RootStore>(self).authStore.updateUser()
      }
      if (clear) {
        self.userDownload.queue.clearSuccessful()
      }
    },
    updateFileStatus(file: FileDownloadType, status: FileDownloadStatusType, path: string, fileName?: string) {
      self.userDownload.queue.updateFileStatus(file, status, path, fileName)
    },
    getNextFileToDownload(): FileDownloadType {
      const nextFile: FileDownloadType = self.userDownload.queue.getNextToDownload()
      if (nextFile) this.setDismissAllBackedUp(false, false)
      return nextFile
    },
    startDownloading(nextFileToDownload?: FileDownloadType) {
      if (self.userDownload.currentlyDownloading()) return
      const fileToDownload: FileDownloadType = nextFileToDownload ?? this.getNextFileToDownload()
      if (!fileToDownload) return
      this.updateFileStatus(fileToDownload, 'in-progress', null, fileToDownload.name)
      const { location, updateStatus } = fileToDownload

      /* on Progress callback */
      const onProgress = (status: FileDownloadStatusType, progress = 0, path = '', fileName = fileToDownload.name) => {
        updateStatus(status, progress, fileToDownload.path, fileName)
        if (status === 'success' || status === 'failed') {
          self.userDownload.queue.setObservedFileDownload()
          this.updateFileStatus(fileToDownload, status, path, fileName)
          this.startDownloading()
        }
      }

      FileDownloader.fileDownload(location.split('-')[0], onProgress, fileToDownload.status)
    },
    dismissAllNeedDownload() {
      self.userDownload.queue.dismissAllNeedDownload()
    },
    clearSuccessful() {
      self.userDownload.queue.clearSuccessful()
    },
    dismissAllFailed() {
      self.userDownload.queue.dismissAllFailed()
    },
    async retryAllFailed() {
      await self.userDownload.queue.retryAllFailed()
      this.startDownloading()
    },
    dismissAllInProgress() {
      self.userDownload.queue.dismissAllInProgress()
    },
    dismissFile(file: FileDownloadType) {
      if (file.status === 'in-progress') return
      self.userDownload.dismissFile(file)
      this.startDownloading()
    },
    async retryFailed(file: FileDownloadType) {
      file.updateStatus('need-download', 0, file.path, file.name)
      const currentFailCount = self.userDownload.failCount
      self.userDownload.queue.setFailCount(currentFailCount - 1)
      this.startDownloading()
    },
    async cancelDownload() {
      await FileDownloader.cancelPendingDownload()
      const file = self.userDownload.currentlyDownloading()
      this.updateFileStatus(file, 'cancelled', file.path, file.name)
      self.userDownload.queue.setObservedFileDownload()
      const nextFileToDownload = this.getNextFileToDownload()
      console.log({ nextFileToDownload })
      if (nextFileToDownload) this.startDownloading(nextFileToDownload)
    },
    removeFileFromQueue(file) {
      self.userDownload.removeFileFromQueue(file)
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.userDownload.queue.resetLoadingError()
      self.startDownloading()
    },
    reset() {
      self.userDownload.queue.reset()
      applySnapshot(self, downloaderInitial)
    },
  }))

export type DownloaderStoreType = Instance<typeof DownloaderStoreModel>
type DownloaderSnapshotInType = SnapshotIn<typeof DownloaderStoreModel>
export const createDownloaderStoreDefaultModel = () => types.optional(DownloaderStoreModel, downloaderInitial)
