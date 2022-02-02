import { applySnapshot, Instance, types } from 'mobx-state-tree'
import { FileSharingController } from '@controllers'
import { translate } from '@i18n'

const sharingSingleInitialValue = {
  fetchShareLoading: false,
  fetchShareError: null,
  revokeShareLoading: false,
  revokeShareError: null,
  link: undefined,
}

const sharingSingleInitialValueLoading = {
  fetchShareLoading: true,
  fetchShareError: null,
  revokeShareLoading: true,
  revokeShareError: null,
  link: undefined,
}

const sharingInitialValueLoading = {
  private: sharingSingleInitialValueLoading,
  public: sharingSingleInitialValueLoading,
}

export const SharingSingleModel = types.model('SharingSingle').props({
  // loading & error handling
  fetchShareLoading: false,
  fetchShareError: types.maybeNull(types.string),
  revokeShareLoading: false,
  revokeShareError: types.maybeNull(types.string),
  link: types.maybe(types.string),
})
export type SharingSingleModelType = Instance<typeof SharingSingleModel>

export const sharingInitialValue = {
  private: sharingSingleInitialValue,
  public: sharingSingleInitialValue,
}

/**
 * File sharing store model
 */
export const SharingModel = types
  .model('Sharing')
  .props({
    private: types.maybe(SharingSingleModel),
    public: types.maybe(SharingSingleModel),
  })
  .views(self => ({
    getPublicShareStatus() {
      const { fetchShareLoading, fetchShareError, link } = self.public
      return {
        loading: fetchShareLoading,
        error: fetchShareError || (fetchShareLoading && translate('file_sharing:error_private_while_public')),
        link,
      }
    },
    getPrivateShareStatus() {
      const { fetchShareLoading, fetchShareError, link } = self.private
      return {
        loading: fetchShareLoading,
        error: fetchShareError || (fetchShareLoading && translate('file_sharing:error_private_while_public')),
        link,
      }
    },
    getRevokePublicShareStatus() {
      const { revokeShareLoading, revokeShareError, link } = self.public
      return {
        loading: revokeShareLoading,
        error: revokeShareError,
        link,
      }
    },
  }))
  .actions(self => ({
    setPublicShareStatus(loading, error = null, link?) {
      const share = self.public
      share.fetchShareLoading = loading
      share.fetchShareError = error
      if (!error) {
        share.link = link
      }
    },
    setPrivateShareStatus(loading, error = null, link?) {
      const share = self.private
      share.fetchShareLoading = loading
      share.fetchShareError = error
      if (!error) {
        share.link = link
      }
    },
    setRevokeShareStatus(loading, error = null) {
      const share = self.public
      share.revokeShareLoading = loading
      share.revokeShareError = error
      if (!error) {
        share.link = undefined
      }
    },
  }))
  .actions(self => ({
    async getPrivateShare(fileLocation) {
      if (self.private.fetchShareLoading || self.public.fetchShareLoading) return
      self.setPrivateShareStatus(true)
      try {
        const result = await FileSharingController.getPrivateFileShare(fileLocation)
        self.setPrivateShareStatus(false, null, result)
      } catch (error) {
        self.setPrivateShareStatus(false, error.message || JSON.stringify(error.message))
      }
    },
    async getPublicShare(fileLocation) {
      if (self.private.fetchShareLoading || self.public.fetchShareLoading) return
      self.setPublicShareStatus(true)
      try {
        const result = await FileSharingController.getPublicFileShare(fileLocation)
        self.setPublicShareStatus(false, null, result)
      } catch (error) {
        self.setPublicShareStatus(false, error.message || JSON.stringify(error))
      }
    },
    async revokePrivateShare(fileLocation) {
      if (self.private.revokeShareLoading) return
      self.setRevokeShareStatus(true)
      try {
        await FileSharingController.revokePublicFileShare(fileLocation)
        self.setRevokeShareStatus(false, null)
      } catch (error) {
        self.setRevokeShareStatus(false, error.message || JSON.stringify(error))
      }
    },
  }))
  .actions(self => ({
    reset() {
      applySnapshot(self, sharingInitialValue)
    },
    resetLoading() {
      applySnapshot(self, sharingInitialValueLoading)
    },
  }))
export type SharingModelType = Instance<typeof SharingModel>
// type SharingSnapshotType = SnapshotOut<typeof SharingModel>
export const createSharingDefaultModel = () => types.optional(SharingModel, sharingInitialValue)
