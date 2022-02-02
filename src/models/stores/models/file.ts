import { types, Instance, applyPatch } from 'mobx-state-tree'
import { SharingModel, sharingInitialValue } from './sharing'
import { FileListController, FileFolderInfo } from '@controllers'
import { hex, FolderFileEntry } from 'opacity-library'

export const FileMapModel = types.map(types.late(() => FileModel))
export type FileMapModelType = Instance<typeof FileMapModel>

/* File model */
export const FileModel = types
  .model('File', {
    /* FILE INFO */
    name: types.string,
    path: types.string,
    uri: types.identifier,
    isDir: types.boolean,
    location: types.maybe(types.string) /* Hash location in BE */,
    filesCount: types.optional(types.number, 0) /* Needed only if isDir === true */,
    type: types.maybe(types.string),
    size: types.maybe(types.number),
    uploaded: types.maybe(types.number),
    modified: types.maybe(types.number),
    isSharedPublic: types.maybe(types.boolean),
    isSharedPrivate: types.maybe(types.boolean),
    isSelected: types.maybe(types.boolean),
    privateHandle: types.maybe(types.string),
    /* MAP */
    fileMap: types.maybe(FileMapModel),
    /* SHARING */
    _sharing: types.maybe(SharingModel),
    /* ERROR AND LOADING */
    loading: false,
    error: types.maybeNull(types.string),
  })
  .actions(self => ({
    setSharingInstance(val?) {
      self._sharing = val
    },
    applyPatch(data) {
      const patches = Object.keys(data).map(key => ({
        op: 'replace' as PatchType,
        path: `/${key}`,
        value: data[key],
      }))
      applyPatch(self, patches)
    },
    createFileMap() {
      self.fileMap = FileMapModel.create()
    },
  }))
  .views(self => ({
    // This view is used to get files sorted via name key
    get name_uppercase() {
      return self.name.toUpperCase()
    },
    get sharing() {
      if (!self._sharing) {
        const val = SharingModel.create(sharingInitialValue)
        self.setSharingInstance(val)
      }
      return self._sharing
    },
    getFileInfo(path) {
      let fileInfo = self
      const pathDirNames = path.split('/').filter(el => el)
      for (const index in pathDirNames) {
        if (fileInfo.isDir && !fileInfo.fileMap) {
          fileInfo.createFileMap()
        }
        fileInfo = fileInfo.fileMap.get(pathDirNames[index])
        if (!fileInfo) return null
      }
      return fileInfo
    },
    getFileMap(path): FileMapModelType {
      const fileInfo = this.getFileInfo(path)
      if (fileInfo.isDir && !fileInfo.fileMap) {
        fileInfo.createFileMap()
      }
      return fileInfo.fileMap
    },
    async fetchFileInfo() {
      const fileEntry: FolderFileEntry = { location: hex.hexToBytes(self.location), name: self.name }
      const fileFolderInfo: FileFolderInfo = await FileListController.mapFileComplete(self.path, fileEntry)
      self.applyPatch(fileFolderInfo)
    },
    getDirStatus(path) {
      const file = this.getFileInfo(path)
      if (!file) return { loading: true, error: false }
      const { loading, error } = this.getFileInfo(path)
      return { loading, error }
    },
    get publicShare() {
      return this.sharing.public.link
    },
    get privateShare() {
      return this.sharing.private.link
    },
    getPrivateShareStatus() {
      return this.sharing.getPrivateShareStatus()
    },
    getPublicShareStatus() {
      return this.sharing.getPublicShareStatus()
    },
    getRevokePublicShareStatus() {
      return this.sharing.getRevokePublicShareStatus()
    },
  }))
  .actions(self => ({
    setDirStatus(path, loading, error = null) {
      const file = self.getFileInfo(path)
      if (file) {
        file.loading = loading
        file.error = error
      }
    },
    setFilesCount(count) {
      self.filesCount = count
    },
    updateDetails(file: any, newPath) {
      if (file.isDir) {
        if (file?.filesCount !== undefined) {
          self.filesCount = file.filesCount
        }
      } else {
        if (file?.isSharedPublic !== undefined) {
          self.isSharedPublic = file.isSharedPublic
        }
        if (file?.isSharedPrivate !== undefined) {
          self.isSharedPrivate = file.isSharedPrivate
        }
      }
      if (file?.modified) {
        self.modified = file.modified
      }
      if (file?.type) {
        self.type = file.type
      }
      if (file?.size) {
        self.size = file.size
      }
      if (file?.uploaded) {
        self.uploaded = file.uploaded
      }
      if (file?.privateHandle) {
        self.privateHandle = file.privateHandle
      }
      if (file.name) {
        self.name = file.name
      }
      if (newPath) {
        file.path = newPath
        self.path = newPath
      }
    },
    updateKey(key, value) {
      self[key] = value
    },
    async getPrivateShare() {
      await self.sharing.getPrivateShare(self.location)
      self.fetchFileInfo()
    },
    async getPublicShare() {
      await self.sharing.getPublicShare(self.location)
      self.fetchFileInfo()
    },
    async revokePrivateShare() {
      await self.sharing.revokePrivateShare(self.location)
      self.fetchFileInfo()
    },
    setSelected(val: boolean) {
      self.isSelected = val
    },
    resetSharingLoading() {
      self._sharing?.resetLoading()
    },
    resetAllDirStatus(dirInfo = self) {
      dirInfo.loading = false
      dirInfo.error = null
      dirInfo._sharing = undefined
      if (dirInfo.fileMap) {
        Array.from(dirInfo.fileMap.values()).forEach((el: FileModelType) => this.resetAllDirStatus(el))
      }
    },
  }))

export type FileModelType = Instance<typeof FileModel>
