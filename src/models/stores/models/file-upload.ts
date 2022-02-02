import { Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree'

/* FileStatus model */
const FileUploadStatusModel = types.enumeration(['need-upload', 'in-progress', 'success', 'failed', 'cancelled'])
export type FileUploadStatusType = Instance<typeof FileUploadStatusModel>

/* FileUpload model */
export const FileUploadModel = types
  .model('FileUpload', {
    name: types.string,
    path: types.identifier,
    size: types.number,
    type: types.maybe(types.string),
    progress: types.optional(types.number, 0),
    status: types.optional(FileUploadStatusModel, 'need-upload'),
    destDir: types.maybe(types.string),
    isAutoSync: types.optional(types.boolean, false), // true if is file part of the autosync queue
  })
  .actions(self => ({
    updateStatus(status: FileUploadStatusType, progress = 0) {
      self.status = status
      self.progress = progress
    },
  }))
export type FileUploadType = Instance<typeof FileUploadModel>
export type FileUploadSnapshotOutType = SnapshotOut<typeof FileUploadModel>
export type FileUploadLiteType = Omit<SnapshotIn<typeof FileUploadModel>, 'status' | 'progress'>
