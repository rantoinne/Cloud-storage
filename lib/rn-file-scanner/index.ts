import { useEffect, useState } from 'react'
import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native'
const { RNFileScanner } = NativeModules
const eventEmitter = new NativeEventEmitter(RNFileScanner)

export type FileScannerConfig = {
  /* current logged inaccount handle */
  accountHandle: string
  /* true => include all photos (starting from syncPhotosFromDate if it exists) */
  includePhotos?: boolean
  /* true => include all videos */
  includeVideos?: boolean
  /* if number then user chooses to sync photos added after timestamp */
  syncPhotosFromDate?: number | null
  /* All files user wants to sync */
  whitelistPaths?: string[]
  hasStorageAccess?: boolean
}
/* MimeType https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
     Since there are too many of them even for the basic list,
     I won't cover all of them here, but the list provided in the url, should be our reference */
/* Mime types must be same for both platforms */
export type FileMime = 'image/png' | 'application/pdf' | 'application/vnd.ms-excel'

/* File syncing status */
export type FileStatus = 'no-sync' | 'needs-sync' | 'synced' | 'upload-in-progress' | 'deleted'

/* File system scanning status */
// NO_ACCESS: SDK will send this event if the SDK can't perform file system scan if hasStorageAccess is false [Permissions Not Granted]
// RUNNING: SDK will send this event if file system scan is running
// FINISHED: SDK will send this event if file system scan is finished
// NO_SCAN: SDK will send this event if received a new config but no new file system scan is needed because the local DB is already up to update
export type ScanStatus = 'NO_ACCESS' | 'RUNNING' | 'FINISHED' | 'NO_SCAN' | 'NEW_FILE' | 'FILE_MODIFIED'

/* File Change Event */
// Send 'FileChange' event name and include parameter in the event body with the name 'path' contains the path of the file
export type FileChange = 'path/to/file'

/* NOT NEEDED */
/* File Deleted Event */
// Send 'FileDelete' event name and include parameter in the event body with the name 'path' contains the path of the file
// type FileDelete = 'path/to/file'

/* File in file system sorting method */
/* (null) value will use local Database order */
export type SortBy = 'name' | 'type' | 'size' | 'date-created'

declare type GetFilesOptions = {
  page: number
  dirPath: string
  sortBy: SortBy | null
  searchText?: string
}

/* Type of File returned from file system scanning */
export type FileSync = {
  status: FileStatus
  path: string
  /* Has a value only if path updated(in case of rename or move) */
  updatedPath: string | null
  type: FileMime
  size: number /* in bytes */
}

/* max (end - start) = max (page size) = 25 */
export type FilePageList = {
  data: FileSync[]
  start: number
  end: number
  page: number
}

export default class FileScanner {
  static currentConfig: FileScannerConfig = {}
  static fileChangedListener: EmitterSubscription
  static scanStatusListener: EmitterSubscription
  static newChangeListener: EmitterSubscription

  /*
   * Let RN set configuration object that contains the AutoSync settings
   * All configuration and permissions should be created from RN side and sent to the native side on initialization and if updated/changed.
   * SDK should initialize itself internally (if not initialized yet) when RN call this method
   * @param config FileScannerConfig object,
   *
   * @return true if the config updated successfully and false if not.
   */
  static async setConfig(config: FileScannerConfig): Promise<boolean | Error> {
    return new Promise<boolean | Error>((resolve, reject) => {
      if (FileScanner._checkIfConfigEqualCurrent(config)) reject(Error('Config no change'))
      else {
        FileScanner._updateConfigObj(config)
        RNFileScanner.setConfig(config, (val: boolean) => {
          val === true ? resolve(true) : reject(Error('Unable to set config'))
        })
      }
    })
  }

  /*
   * Let RN get the files list in specific directory (path)
   * @param getFilesOptions GetFilesOptions object,
   *
   * @return FilePageList object contains the files list and pagination info, Directories should be listed first, if sortBy value is 'date-created' or 'name'
   */
  static async getFilesInDir(config: GetFilesOptions): Promise<FilePageList> {
    return new Promise(resolve => RNFileScanner.getFilesInDir(config, resolve))
  }

  /*
   * Let RN update the Native side when files status changed
   * FileSync object should include two fields only 'path' and 'status'
   * @param filesList array of files, each file sync object contains only two fields
   *        'path': file path
   *        'status': the file status value, one of the following ('upload-in-progress' | 'upload-failed' | 'synced')
   *
   * @return true if the files status updated successfully and false if not.
   */
  static async updateFilesStatus(files: { path: string; status: FileStatus }[]): Promise<FilePageList> {
    return new Promise(resolve => RNFileScanner.updateFilesStatus(files, resolve))
  }

  /*
   * Let RN get the files count that have a specific status (i.e 'needs-sync')
   * @param status FileStatus value, status could be null and in this case return all files (Not included folders) count regardless of FileStatus
   *
   * @return number
   */
  static async getTotalCount(status: FileStatus | null = null): Promise<number> {
    return new Promise(resolve => RNFileScanner.getTotalCount(status, resolve))
  }

  /*
   */
  static async cleanDB(): Promise<boolean> {
    return new Promise(resolve => RNFileScanner.cleanDB(resolve))
  }

  /* EVENT LISTENERS */
  static onScanStatus(cb: (status: ScanStatus) => void) {
    if (Platform.OS === 'ios') return
    const scanStatusListener = eventEmitter.addListener('ScanStatus', event => {
      console.log({ event });
      cb(event.status)
    })
    return () => scanStatusListener.remove()
  }

  static onFileChange(cb: (status: ScanStatus) => void) {
    if (Platform.OS === 'ios') return
    const fileChangedListener = eventEmitter.addListener('FileChange', event => {
      cb(event.path)
    })
    return () => fileChangedListener.remove()
  }

  static onNewChange(cb: (status: ScanStatus) => void) {
    if (Platform.OS === 'ios') return
    const changeListener = eventEmitter.addListener('NewChange', cb)
    return () => changeListener.remove()
  }

  /* HELPERS */
  static _checkIfConfigEqualCurrent(newConfig: FileScannerConfig): boolean {
    const currentConfig = FileScanner.currentConfig
    return (
      newConfig.includePhotos === currentConfig.includePhotos &&
      newConfig.includeVideos === currentConfig.includeVideos &&
      newConfig.syncPhotosFromDate === currentConfig.syncPhotosFromDate &&
      newConfig.whitelistPaths === currentConfig.whitelistPaths &&
      newConfig.hasStorageAccess === currentConfig.hasStorageAccess
    )
  }

  static _updateConfigObj(config: FileScannerConfig) {
    FileScanner.currentConfig = { ...FileScanner.currentConfig, ...config }
  }
}

/* HOOKS (if needed) */
export const useScanStatus = () => {
  if (!eventEmitter) return { scanStatus: null }
  const [scanStatus, setScanStatus] = useState<ScanStatus>()
  useEffect(() => {
    const unsubscribe = FileScanner.onScanStatus(setScanStatus)
    return () => unsubscribe?.()
  }, [scanStatus])
  return { scanStatus }
}
