import { detach, getSnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { FileUploadModel, FileUploadType, FileUploadStatusType } from './file-upload'
import RNBlobUtil from 'react-native-blob-util'

function queueMaptoFailedList([, file]): FileUploadType | null {
  if (file.status === 'failed') return file
  return null
}

const queueInitial: QueueSnapshotInType = {
  _observedFile: undefined,
}

/**
 * Queue model.
 */
export const QueueModel = types
  .model('Queue')
  .props({
    queueMap: types.optional(types.map(FileUploadModel), {}),
    successMap: types.optional(types.map(FileUploadModel), {}),
    _observedFile: types.maybe(types.reference(FileUploadModel)),
  })
  .views(self => ({
    get size() {
      return self.queueMap.size
    },
    get failCount() {
      let count = 0
      self.queueMap.forEach(el => el.status === 'failed' && count++)
      return count
    },
    get queueInterator() {
      return self.queueMap.values()
    },
    get successCount() {
      return self.successMap.size
    },
    get observedFile(): FileUploadType {
      try {
        if (!self._observedFile) return undefined
        return getSnapshot<FileUploadType>(self._observedFile) as FileUploadType
      } catch (_) {
        self._observedFile = undefined
        return undefined
      }
    },
  }))
  .actions(self => ({
    delete(key) {
      self.queueMap.delete(key)
    },
    merge(items) {
      self.queueMap.merge(items)
    },
    set(key, value) {
      self.queueMap.set(key, value)
    },
  }))
  .actions(self => ({
    setObservedFileUpload(file?: FileUploadType) {
      self._observedFile = file
    },
    clearSuccessful() {
      self.successMap.clear()
    },
    updateFileStatus(file: FileUploadType, status: FileUploadStatusType) {
      if (status === 'success') {
        this.setObservedFileUpload()
        const fileSnapshot = detach(self.queueMap.get(file.path))
        self.queueMap.delete(fileSnapshot.path)
        self.successMap.set(fileSnapshot.path, { ...fileSnapshot, status: 'success' })
      }
      if (status === 'failed') {
        this.setObservedFileUpload()
      }
      if (status === 'in-progress') {
        if (self.observedFile && file.path === self.observedFile.path) return
        this.setObservedFileUpload(file)
      }
    },
    getNextToUpload(): FileUploadType {
      for (const file of self.queueInterator) {
        if (file.status === 'need-upload') {
          return file
        }
      }
      return null
    },
    isAlreadyInQueue(file: FileUploadType) {
      return self.queueMap.has(file.path)
    },
    getStatus(file: FileUploadType) {
      if (this.isAlreadyInQueue(file)) {
        if (this.isStatusFailed(file)) {
          return 'failed'
        } else {
          return 'uploading' // for in-progress & need-upload
        }
      } else {
        return 'not-found'
      }
    },
    isStatusFailed(file: FileUploadType) {
      return file.status === 'failed'
    },
    async retryFailed(file: FileUploadType) {
      const exists = await RNBlobUtil.fs.exists(file.path.replace('file://', ''))
      if (exists) {
        file.updateStatus('need-upload')
      } else {
        self.delete(file.path)
      }
    },
    async retryAllFailed() {
      const failedList = Array.from(self.queueMap, queueMaptoFailedList).filter(el => el)
      const failedFileList = failedList.map(el => el.path.replace('file://', ''))
      const existsPromiseList = await Promise.all(failedFileList.map(RNBlobUtil.fs.exists))
      existsPromiseList.forEach((exists, index) => {
        const file = failedList[index]
        exists ? file.updateStatus('need-upload') : self.delete(file.path)
      })
    },
    dismissAllFailed() {
      self.queueMap.forEach(el => {
        if (el.status === 'failed') self.queueMap.delete(el.path)
      })
    },
    dismissFailedFile(file) {
      if (file.status === 'failed') {
        self.queueMap.delete(file.path)
      }
    },
    dismissAllNeedUpload() {
      self.queueMap.forEach(el => {
        if (el.status === 'need-upload') {
          el.updateStatus('failed')
        }
      })
    },
    dismissFile(file) {
      if (file.status === 'failed') {
        self.queueMap.delete(file.path)
      } else {
        file.updateStatus('failed')
      }
    },
    dismissInProgress() {
      const filePath = self.observedFile.path
      self.queueMap.get(filePath).updateStatus('failed')
      this.setObservedFileUpload()
    },
  }))
  .actions(self => ({
    resetLoadingErrorFailAll() {
      self.setObservedFileUpload()
      self.queueMap.forEach(file => file.updateStatus('failed'))
      self.successMap.clear()
    },
    resetLoadingError() {
      self.setObservedFileUpload()
      self.queueMap.forEach(el => {
        if (el.status === 'in-progress') el.updateStatus('need-upload')
      })
      self.successMap.clear()
    },
    reset() {
      self.setObservedFileUpload()
      self.queueMap.clear()
      self.successMap.clear()
    },
  }))

export type QueueType = Instance<typeof QueueModel>
type QueueSnapshotInType = SnapshotIn<typeof QueueModel>
export const createQueueDefaultModel = () => types.optional(QueueModel, queueInitial)
