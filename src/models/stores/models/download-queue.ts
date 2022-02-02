import { getSnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { FileDownloadModel, FileDownloadType, FileDownloadStatusType } from './file-download'

const queueInitial: QueueSnapshotInType = {
  _observedFile: undefined,
}

/**
 * Download Queue model.
 */
export const DownloadQueueModel = types
  .model('DownloadQueue')
  .props({
    queueMap: types.optional(types.map(FileDownloadModel), {}),
    successMap: types.optional(types.map(FileDownloadModel), {}),
    failCount: types.optional(types.number, 0),
    _observedFile: types.maybe(types.reference(FileDownloadModel)),
  })
  .views(self => ({
    get size() {
      return self.queueMap.size
    },
    get successCount() {
      return self.successMap.size
    },
    get observedFile(): FileDownloadType {
      try {
        if (!self._observedFile) return undefined
        return getSnapshot<FileDownloadType>(self._observedFile) as FileDownloadType
      } catch (_) {
        self._observedFile = undefined
        return undefined
      }
    },
    get cancelledCount() {
      const queueArray = Array.from(self.queueMap.values())
      return queueArray.filter(el => el.status === 'cancelled').length
    },
    get currentlyDownloadingCount() {
      const downloadingStatuses = ['in-progress', 'need-download']
      const queueArray = Array.from(self.queueMap.values())
      const downloadingFiles = queueArray.filter(queue => downloadingStatuses.includes(queue.status))
      return downloadingFiles.length
    },
  }))
  .actions(self => ({
    currentlyDownloading() {
      const queueArray = Array.from(self.queueMap.values())
      return queueArray.find(queue => queue.status === 'in-progress')
    },
    delete(key) {
      self.queueMap.delete(key)
    },
    merge(items) {
      self.queueMap.merge(items)
    },
    set(key, value) {
      const { name, type, size, path } = value
      self.queueMap.set(key, { ...{ name, location: key, type, size, path } })
    },
  }))
  .actions(self => ({
    setObservedFileDownload(file?: FileDownloadType) {
      self._observedFile = file
    },
    clearSuccessful() {
      self.successMap.clear()
    },
    updateFileStatusForCancelled() {
      this.setFailCount(self.failCount + 1)
    },
    filesCurrentlyInNextUp() {
      const queueMapArray = Array.from(self.queueMap.values())
      const nextUpFiles = queueMapArray.filter(file => file.status === 'need-download')
      return nextUpFiles
    },
    updateFileStatus(file: FileDownloadType, status: FileDownloadStatusType, path: string, fileName: string) {
      switch (status) {
        case 'in-progress':
          {
            const nextUpFiles = this.filesCurrentlyInNextUp()
            if (nextUpFiles.length > 0 && (file.status === 'cancelled' || file.status === 'failed')) return
            this.setObservedFileDownload(file)
          }
          return
        case 'failed':
          file.updateStatus('failed', 0, path, fileName)
          this.updateFileStatusForCancelled()
          return
        case 'cancelled':
          file.updateStatus('cancelled', 0, path, fileName)
          this.setObservedFileDownload()
          return
        default: {
          this.setObservedFileDownload()
          let fileSnapshot = getSnapshot(file)
          fileSnapshot = {
            ...fileSnapshot,
            path,
            name: fileName,
          }
          self.queueMap.delete(fileSnapshot.location)
          self.successMap.set(fileSnapshot.location, fileSnapshot)
        }
      }
    },
    getNextToDownload(): FileDownloadType {
      const queue = Array.from(self.queueMap.values())
      const file = queue.find(el => el.status === 'need-download')
      if (file && file.status !== 'cancelled') return file
      return null
    },
    isAlreadyInQueue(file: FileDownloadType) {
      return self.queueMap.has(file.location)
    },
    getStatus(file: FileDownloadType) {
      if (this.isAlreadyInQueue(file)) {
        if (this.isStatusFailed(file)) {
          return 'failed'
        } else {
          return 'in-progress' // for in-progress & need-download
        }
      } else {
        return 'not-found'
      }
    },
    isStatusFailed(file: FileDownloadType) {
      return file.status === 'failed'
    },
    setFailCount(val: number) {
      self.failCount = val
    },
    async retryFailed(file: FileDownloadType) {
      if (file.status === 'failed') {
        this.setFailCount(self.failCount - 1)
      }
      file.updateStatus('need-download', 0, file.path, file.name)
    },
    async retryAllFailed() {
      self.queueMap.forEach(file => {
        if (file.status === 'failed' || file.status === 'cancelled') {
          file.updateStatus('need-download', 0, file.path, file.name)
        }
      })
      this.setFailCount(0)
    },
    dismissAllFailed() {
      self.queueMap.forEach(el => {
        if (el.status === 'failed' || el.status === 'cancelled') self.queueMap.delete(el.location)
      })
      this.setFailCount(0)
    },
    dismissAllNeedDownload() {
      self.queueMap.forEach(el => {
        if (el.status === 'need-download') self.queueMap.delete(el.location)
      })
    },
    dismissAllInProgress() {
      self.queueMap.forEach(el => {
        if (el.status === 'in-progress') self.queueMap.delete(el.location)
      })
    },
    dismissFile(fileToDismiss) {
      if (fileToDismiss.status === 'failed') this.setFailCount(self.failCount - 1)

      self.queueMap.forEach(file => {
        if (file.location === fileToDismiss.location) file.updateStatus('cancelled', 0, file.path, file.name)
      })
    },
    removeFileFromQueue(fileToRemove) {
      if (fileToRemove.status === 'failed') this.setFailCount(self.failCount - 1)

      self.queueMap.forEach(file => {
        if (file.location === fileToRemove.location) self.queueMap.delete(file.location)
      })
    },
  }))
  .actions(self => ({
    resetLoadingErrorFailAll() {
      self.setObservedFileDownload()
      self.queueMap.forEach(file => file.updateStatus('failed', 0, file.path))
      self.setFailCount(self.queueMap.size)
      self.successMap.clear()
    },
    resetLoadingError() {
      self.setObservedFileDownload()
      self.queueMap.forEach(el => {
        if (el.status === 'in-progress') el.updateStatus('need-download', 0, el.path, el.name)
      })
      self.successMap.clear()
    },
    reset() {
      self.queueMap.clear()
      self.successMap.clear()
      self.setFailCount(0)
    },
  }))

export type QueueType = Instance<typeof DownloadQueueModel>
type QueueSnapshotInType = SnapshotIn<typeof DownloadQueueModel>
export const createQueueDefaultModel = () => types.optional(DownloadQueueModel, queueInitial)
