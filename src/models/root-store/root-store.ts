import { Instance, SnapshotOut, types } from 'mobx-state-tree'
import { createAuthDefaultModel } from '../stores/auth'
import { createGeneralDefaultModel, UserAppStatusType } from '../stores/general'
import { createFileStoreDefaultModel } from '../stores/file-list'
import { createUploaderStoreDefaultModel } from '../stores/uploader'
import { createFileHandlerStoreDefaultModel } from '../stores/file-handler'
import { createFileOpsDefaultModel } from '../stores/file-ops'
import { createDownloaderStoreDefaultModel } from '@models/stores/downloader'

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model('RootStore').props({
  authStore: createAuthDefaultModel(),
  generalStore: createGeneralDefaultModel(),
  fileListStore: createFileStoreDefaultModel(),
  fileHandlerStore: createFileHandlerStoreDefaultModel(),
  uploaderStore: createUploaderStoreDefaultModel(),
  fileOpsStore: createFileOpsDefaultModel(),
  downloaderStore: createDownloaderStoreDefaultModel(),
})
.actions(self => ({
  resetLoadingError() {
    Object.values(self).forEach(store => {
      store.resetLoadingError && store.resetLoadingError()
    });
  },
  reset(userAppStatus?: UserAppStatusType){
    Object.values(self).forEach(store => {
      if(store.userAppStatus) store.reset(userAppStatus)
      else store.reset && store.reset()
    });
  },
  // same as reset, minus the authentication reseting
  purge(userAppStatus?: UserAppStatusType){
    Object.values(self).forEach(store => {
      if(store.userAppStatus) store.reset(userAppStatus)
      else if (!store.handle) store.reset && store.reset()
    });
  },
}))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
