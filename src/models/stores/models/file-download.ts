import { Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree'

/* FileStatus model */
const FileDownloadStatusModel = types.enumeration(['need-download', 'in-progress', 'success', 'failed', 'cancelled'])
export type FileDownloadStatusType = Instance<typeof FileDownloadStatusModel>

/* FileDownload model */
export const FileDownloadModel = types
  .model('FileDownload', {
    name: types.string,
    location: types.identifier,
    type: types.maybe(types.string),
    size: types.maybe(types.number),
    status: types.optional(FileDownloadStatusModel, 'need-download'),
    progress: types.optional(types.number, 0),
    path: types.optional(types.string, ''),
  })
  .actions(self => ({
    updateStatus(status: FileDownloadStatusType, progress = 0, path = '', fileName = self.name) {
      self.path = path
      self.name = fileName
      self.status = status
      self.progress = progress
    },
    updatePath(path: string) {
      self.path = path
    },
  }))
export type FileDownloadType = Instance<typeof FileDownloadModel>
export type FileDownloadSnapshotOutType = SnapshotOut<typeof FileDownloadModel>
export type FileDownloadLiteType = Omit<SnapshotIn<typeof FileDownloadModel>, 'status' | 'progress'>
