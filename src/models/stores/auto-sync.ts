import { applySnapshot, getParent, getSnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree'
import { AutoSyncController } from '@controllers'
import { reduceArrayToObjectByKey, applyPatch } from '@utils'
import { FileUploadStatusType, FileUploadType, QueueModel } from './models'
import { FileStatus } from 'lib/rn-file-scanner'
import { UploaderStoreType } from './uploader'

export const autoSyncInitial: AutoSyncSnapshotInType = {
  lastGlobalIndex: 0,
  totalCount: 0,
  loadingNextPage: false,
}

/**
 * AutoSync store model.
 */
export const AutoSyncStoreModel = types
  .model('AutoSyncStore')
  .props({
    queue: types.optional(QueueModel, {}),
    // these numbers are needed to fetch from where you left off last time, to prevent adding duplicates
    // IMPORTANT: lastGlobalIndex reflect last index in the actual list, not the filtered one
    lastGlobalIndex: types.number,
    // total local count of files 'needs-sync' in local device
    totalCount: types.number,
    loadingNextPage: false,
  })
  .views(self => ({
    get failCount() {
      return self.queue.failCount
    },
    get shadowSize() {
      return self.totalCount
    },
    get successCount() {
      return self.queue.successCount
    },
  }))
  .actions(self => ({
    /* *************** INTERNAL *************** */
    setLastGlobalIndex(val: number) {
      self.lastGlobalIndex = val
    },
    setTotalCount(val: number) {
      self.totalCount = val
    },
    setLoadingNextPage(val: boolean) {
      self.loadingNextPage = val
    },
    async updateTotalCount() {
      const totalCount = await AutoSyncController.fetchTotalToBeSyncedCount()
      this.setTotalCount(totalCount)
      return totalCount
    },
    async resetAndCleanDB() {
      await AutoSyncController.cleanDB()
      const totalCount = await AutoSyncController.fetchTotalToBeSyncedCount()
      self.queue.reset()
      applyPatch(self, { lastGlobalIndex: 0, loadingNextPage: false, totalCount })
    },
    /* *************** EXTERNAL *************** */
    async updateFileStatus(file: FileUploadType, status: FileUploadStatusType) {
      const path = file.path
      self.queue.updateFileStatus(file, status)
      if (status === 'success' || status === 'failed') {
        const dbStatus: FileStatus = status === 'success' ? 'synced' : 'needs-sync'
        await AutoSyncController.updateFileStatusToSynced(path, dbStatus)
        this.startAutoSync()
      }
    },
    async startAutoSync() {
      if ((await this.updateTotalCount()) > 0 && self.queue.size - self.failCount === 0) {
        await this.syncNextPage()
        getParent<UploaderStoreType>(self).startUploading()
      }
    },
    async syncNextPage() {
      if (self.loadingNextPage || (await this.updateTotalCount()) === 0) return
      try {
        this.setLoadingNextPage(true)
        const { list, lastGlobalIndex } = await AutoSyncController.getNextToSyncPage(self.lastGlobalIndex)
        // If (list length == 0), then we missed some files, because (totalCount != zero)
        // If (queue.size == zero), then queue is empty
        if (list.length === 0 && self.queue.size === 0) {
          await this.resetAndCleanDB()
          this.setLoadingNextPage(false)
          return this.syncNextPage()
        }

        if (lastGlobalIndex > self.lastGlobalIndex) {
          this.setLastGlobalIndex(lastGlobalIndex)
          self.queue.merge(reduceArrayToObjectByKey('path', list))
        }
      } finally {
        this.setLoadingNextPage(false)
      }
    },
    async dismissFile(file: FileUploadType) {
      const fileSnapshot = getSnapshot(file)
      await AutoSyncController.updateFileStatusToSynced(fileSnapshot.path, 'no-sync')
      self.queue.dismissFile(fileSnapshot)
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      self.queue.resetLoadingError()
    },
    reset() {
      self.queue.reset()
      applySnapshot(self, autoSyncInitial)
    },
  }))

export type AutoSyncStoreType = Instance<typeof AutoSyncStoreModel>
type AutoSyncSnapshotInType = SnapshotIn<typeof AutoSyncStoreModel>
export const createAutoSyncStoreDefaultModel = () => types.optional(AutoSyncStoreModel, autoSyncInitial)
