import { Instance, SnapshotIn, types, applySnapshot, getParent, flow } from 'mobx-state-tree'
import { UserModel, UserType } from './models'
import { MetaController, AuthController } from '@controllers'
import { RootStore } from '@models/root-store/root-store'

const authInitialLoadingError = {
  signInLoading: false,
  signInError: null,
  signUpLoading: false,
  signUpError: null,
  signOutLoading: false,
  signOutError: null,
  recoverHandleLoading: false,
  recoverHandleError: null,
  createHandleLoading: false,
  createHandleError: null,
  updateUserLoading: false,
  updateUserError: null,
}

const authInitial: AuthSnapshotInType = {
  ...authInitialLoadingError,
  handle: undefined,
  user: undefined,
  crypto: undefined,
  mnemonic: [],
}

/**
 * Authentication store model.
 */
export const AuthStoreModel = types
  .model('Auth')
  .props({
    handle: types.maybe(types.string),
    user: types.maybe(UserModel),
    crypto: types.maybe(
      types.frozen({
        asymmetricKey: types.string,
        symmetricKey: types.string,
        logging: types.optional(types.boolean, false),
      }),
    ),
    mnemonic: types.array(types.string),
    signInLoading: false,
    signInError: types.maybeNull(types.string),
    signUpLoading: false,
    signUpError: types.maybeNull(types.string),
    signOutLoading: false,
    signOutError: types.maybeNull(types.string),
    recoverHandleLoading: false,
    recoverHandleError: types.maybeNull(types.string),
    createHandleLoading: false,
    createHandleError: types.maybeNull(types.string),
    updateUserLoading: false,
    updateUserError: types.maybeNull(types.string),
  })
  .actions(self => ({
    setSignInStatus: (loading, error = null, data?: { handle: string; user: UserType; crypto }) => {
      self.signInLoading = loading
      self.signInError = error
      if (!error && data) {
        const { handle, user, crypto } = data
        self.handle = handle
        self.user = user
        self.crypto = crypto
      }
    },
    setSignUpStatus: (loading, error = null, data?: { handle: string; user: UserType; crypto }) => {
      self.signUpLoading = loading
      self.signUpError = error
      if (!error && data) {
        const { user, crypto } = data
        self.user = user
        self.crypto = crypto
      }
    },
    setCreateHandleStatus: (loading, error = null, data?: { handle: string; mnemonic: string[] }) => {
      self.createHandleLoading = loading
      self.createHandleError = error
      if (!error && data) {
        const { handle, mnemonic } = data
        self.handle = handle
        self.mnemonic.replace(mnemonic)
      }
    },
    setRecoverHandleStatus: (loading, error = null, data?: { handle: string }) => {
      self.recoverHandleLoading = loading
      self.recoverHandleError = error
      if (!error && data) {
        self.handle = data.handle
      }
    },
    setSignOutStatus: (loading, error = null) => {
      self.signOutLoading = loading
      self.signOutError = error
    },
    setUpdateUserStatus: (loading, error = null, user?: UserType) => {
      self.updateUserLoading = loading
      self.updateUserError = error
      if (!error && user) {
        self.user = user
      }
    },
  }))
  .actions(self => ({
    signIn: flow(function* (handle: string, createAccount?: boolean) {
      const generalStore = getParent<RootStore>(self).generalStore
      self.setSignInStatus(true)
      try {
        /* Sign in using user handle, get account info */
        const { user, crypto } = yield AuthController.signIn(handle)
        /* If different or new user reset all previous data */
        if ((self.handle && self.handle !== handle) || createAccount) {
          getParent<RootStore>(self).purge('firstTimeSetup')
        } else {
          generalStore.setUserAppStatus('mainScreen')
          generalStore.refreshBackupMnemonicStatus()
        }
        /* Start fetching files */
        getParent<RootStore>(self).fileListStore.fetchDirMetadata('/')
        self.setSignInStatus(false, null, { handle, user, crypto })
      } catch (error) {
        if (error.message.includes('no account with that id')) {
          getParent<RootStore>(self).reset()
        }
        self.setSignInStatus(false, error.message)
      }
    }),
    updateUser: flow(function* (updateLoader = true) {
      if (self.updateUserLoading) return
      try {
        if (updateLoader) {
          self.setUpdateUserStatus(true)
        }
        /* Get latest account info */
        const user = yield AuthController.fetchUserData()
        self.setUpdateUserStatus(false, null, user)
      } catch (error) {
        self.setUpdateUserStatus(false, error)
      }
    }),
    signUp: flow(function* () {
      self.setSignUpStatus(true)
      try {
        /* Sign in using user handle which user created, get account info */
        const { user, crypto, handle } = yield AuthController.signUp(self.handle)
        getParent<RootStore>(self).purge()
        getParent<RootStore>(self).fileListStore.fetchDirMetadata('/')
        self.setSignUpStatus(false, null, { user, crypto, handle })
      } catch (error) {
        self.setSignUpStatus(false, error.message)
      }
    }),
    createHandle: flow(function* () {
      self.setCreateHandleStatus(true)
      try {
        const { mnemonic, handle } = yield AuthController.createHandle()
        self.setCreateHandleStatus(false, null, { handle, mnemonic })
      } catch (error) {
        self.setCreateHandleStatus(false, error.message)
      }
    }),
    recoverHandle: flow(function* (mnemonic: string[]) {
      self.setRecoverHandleStatus(true)
      try {
        const { handle } = yield AuthController.recoverHandle(mnemonic)
        self.setRecoverHandleStatus(false, null, { handle })
      } catch (error) {
        self.setRecoverHandleStatus(false, error.message)
      }
    }),
    signOut: () => {
      self.setSignOutStatus(true)
      MetaController.clear()
      getParent<RootStore>(self).reset()
      self.setSignOutStatus(false)
    },
  }))
  .actions(self => ({
    resetLoadingError() {
      applySnapshot(self, { ...self, ...authInitialLoadingError })
    },
    reset() {
      applySnapshot(self, authInitial)
    },
  }))

export type AuthType = Instance<typeof AuthStoreModel>
type AuthSnapshotInType = SnapshotIn<typeof AuthStoreModel>
export const createAuthDefaultModel = () => types.optional(AuthStoreModel, {})
