import { Instance, types, applySnapshot, getParent, SnapshotIn } from 'mobx-state-tree'
import { Platform } from 'react-native'
import { hasPhotoAccess, reduceArrayToObjectByKey } from '@utils'
import { RootStore } from '@models/root-store/root-store'
import { AutoSyncController } from '@controllers'
const isIOS = Platform.OS === 'ios'
const disableSync = false
const UserAppStatusModel = types.enumeration(['firstTimeOpenApp', 'signInUp', 'firstTimeSetup', 'mainScreen'])
const BackupMnemonicStatus = types.enumeration(['backedUp', 'notBackedUp', 'remindMeLater'])
const ScanStatus = types.enumeration(['NO_ACCESS', 'RUNNING', 'FINISHED', 'NO_SCAN', 'NEW_FILE', 'FILE_MODIFIED'])

export type UserAppStatusType = Instance<typeof UserAppStatusModel>
export type BackupMnemonicStatusType = Instance<typeof BackupMnemonicStatus>
export type ScanStatusType = Instance<typeof ScanStatus>

const initialStateOnReset: GeneralSnapshotInType = {
  userAppStatus: 'firstTimeOpenApp',
  backupMnemonicStatus: 'notBackedUp',
  listLayoutStyle: false,
  spaceUsedDismissed: false,
  autoBackUpTurnedOn: false,
  backUpFromDate: null,
  backUpVideos: false,
  backUpPhotos: false,
  hasStorageAccess: false,
  scanStatus: 'NO_ACCESS',
}

/**
 * General store model.
 */
export const GeneralStoreModel = types
  .model('General')
  .props({
    userAppStatus: UserAppStatusModel,
    backupMnemonicStatus: BackupMnemonicStatus,
    listLayoutStyle: types.boolean,
    spaceUsedDismissed: types.boolean,
    autoBackUpTurnedOn: types.boolean,
    backUpFromDate: types.maybeNull(types.number),
    backUpVideos: types.boolean,
    backUpPhotos: types.boolean,
    hasStorageAccess: types.boolean,
    scanStatus: types.maybe(ScanStatus),
    configChangeShowWarning: true,
  })
  .views(self => ({
    get spaceUsedRatio(): number {
      const { storageUsed, storageLimit } = getParent<RootStore>(self).authStore.user?.account
      return storageUsed / storageLimit
    },
    get isActualBackupTurnedOn(): boolean {
      const { autoBackUpTurnedOn, backUpPhotos, backUpVideos } = self
      return autoBackUpTurnedOn && (backUpPhotos || backUpVideos)
    },
    get backUpAllMedia(): boolean {
      return self.backUpFromDate === null
    },
  }))
  .actions(self => ({
    afterCreate() {
      if (isIOS) return
      AutoSyncController.onScanStatus((status: any) => {
        console.log({ status })
        this.setScanStatus(status)
        if (['NO_SCAN', 'FINISHED', 'NEW_FILE'].includes(status)) {
          getParent<RootStore>(self).uploaderStore.autoSync.startAutoSync()
        }
      })
      AutoSyncController.onFileChange((path: string, size: number) => {
        const autoSyncStore = getParent<RootStore>(self).uploaderStore
        const queueMapArray = Array.from(autoSyncStore.autoSync.queue.queueMap.values())
        const targetFile = queueMapArray.find(el => el.path === path)
        if (targetFile) {
          if (targetFile.status === 'in-progress') {
            autoSyncStore.dismissInProgress()
            autoSyncStore.autoSync.queue.setObservedFileUpload()
          }
          autoSyncStore.dismissFile(targetFile)
          const updatedFile = {
            name: targetFile.name,
            path: path,
            size: size,
            type: targetFile.type,
            progress: 0,
            status: 'need-upload',
            destDir: targetFile.destDir,
            isAutoSync: true,
          }
          autoSyncStore.autoSync.queue.merge(reduceArrayToObjectByKey('path', [updatedFile]))
          autoSyncStore.autoSync.startAutoSync()
        }
      })
    },
    setConfigChangeShowWarning(val: boolean) {
      self.configChangeShowWarning = val
    },
    setUserAppStatus(status: UserAppStatusType) {
      self.userAppStatus = status
    },
    setSpaceUsedDismissed(status = true) {
      self.spaceUsedDismissed = status
    },
    async setAutoBackUpTurnedOn(val: boolean) {
      self.autoBackUpTurnedOn = val
      this.setConfigChangeShowWarning(val)
    },
    async setBackUpAllMedia(val: boolean) {
      let backUpFromDate = self.backUpFromDate
      if (val) {
        backUpFromDate = null
      } else {
        if (backUpFromDate === null) {
          backUpFromDate = new Date().getTime()
        }
      }
      // update only if there's difference
      if (backUpFromDate !== self.backUpFromDate) {
        self.backUpFromDate = backUpFromDate
        if (self.autoBackUpTurnedOn) {
          this.updateSyncConfig()
        }
        return true
      }
      return false
    },
    setBackUpVideos(val: boolean) {
      self.backUpVideos = val
    },
    setBackUpPhotos(val: boolean) {
      self.backUpPhotos = val
    },
    refreshBackupMnemonicStatus() {
      const authStore = getParent<RootStore>(self).authStore
      /* When user creates a user session from Sign Up */
      if (authStore.mnemonic?.length) {
        /* User clicked remindMeLater previously */
        if (self.backupMnemonicStatus === 'remindMeLater') {
          self.backupMnemonicStatus = 'notBackedUp'
        }
        /* When user creates a user session from Sign In */
      } else {
        self.backupMnemonicStatus = 'backedUp'
      }
    },
    setBackupMnemonicStatus(val: BackupMnemonicStatusType) {
      self.backupMnemonicStatus = val
    },
    setListLayoutStyle(val = true) {
      self.listLayoutStyle = val
    },
    setHasStorageAccess(val: any) {
      self.hasStorageAccess = val
    },
    setScanStatus(val: any) {
      self.scanStatus = val
    },
    async updateSyncConfig() {
      try {
        const disableSync = false
        if (disableSync) {
          console.log('not running autosync config')
          return
        }
        console.log('updating sync config')
        const accountHandle = getParent<RootStore>(self).authStore.handle
        await this.checkAccessForAutoUpload()
        await AutoSyncController.setConfig({
          accountHandle,
          includePhotos: self.backUpPhotos,
          includeVideos: self.backUpVideos,
          // both device permissions and auto backup set by user should be true
          hasStorageAccess: self.hasStorageAccess && self.autoBackUpTurnedOn,
          syncPhotosFromDate: self.backUpFromDate,
        })
      } finally {
        const uploaderStore = getParent<RootStore>(self).uploaderStore
        if (!self.autoBackUpTurnedOn) {
          uploaderStore.autoSync.reset()
          uploaderStore.dismissInProgress()
        } else {
          uploaderStore.autoSync.startAutoSync()
        }
      }
    },
    async checkAccessForAutoUpload() {
      if (self.autoBackUpTurnedOn) {
        this.setHasStorageAccess(await hasPhotoAccess())
      }
    },
  }))
  .actions(self => ({
    async resetLoadingError() {
      // This is needed to check access on every load
      // While no access given, while auto upload is true, then show badge on home
      self.checkAccessForAutoUpload()
      // call setConfig on each app launch
      if (self.autoBackUpTurnedOn) {
        self.updateSyncConfig()
      }
      self.setSpaceUsedDismissed(false)
    },
    reset(userAppStatus: UserAppStatusType = 'signInUp') {
      AutoSyncController.setConfig({
        accountHandle: '',
        hasStorageAccess: false,
        includePhotos: false,
        includeVideos: false,
      })
      applySnapshot(self, { ...initialStateOnReset, userAppStatus })
    },
  }))

export type GeneralType = Instance<typeof GeneralStoreModel>
type GeneralSnapshotInType = SnapshotIn<typeof GeneralStoreModel>
export const createGeneralDefaultModel = () => types.optional(GeneralStoreModel, initialStateOnReset)
