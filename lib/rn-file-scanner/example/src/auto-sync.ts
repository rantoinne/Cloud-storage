import { Platform } from 'react-native'
import RNFileScanner, { FileScannerConfig, FileStatus, FileSync } from 'rn-file-scanner'

const isIOS = Platform.OS === 'ios'
export const MAX_PAGE_SIZE = 25

export class AutoSyncController {
  static intialized = false

  static async setConfig(config: FileScannerConfig): Promise<void> {
    if (isIOS) return
    await RNFileScanner.setConfig(config)
    AutoSyncController.intialized = true
  }

  static onScanStatus = RNFileScanner.onScanStatus

  static cleanDB = (): Promise<boolean> | boolean => {
    if (!AutoSyncController.intialized) return false
    return RNFileScanner.cleanDB()
  }

  /*
    Called by uploader store when file successfuly uploaded
  */
  static async updateFileStatusToSynced(filePath: string, status: FileStatus) {
    if (isIOS) return
    if (!AutoSyncController.intialized) return
    await RNFileScanner.updateFilesStatus([{ path: filePath, status }])
  }

  /*
    Get total files count with status 'needs-sync'
  */
  static totalCountNeedSync = 0
  static async fetchTotalToBeSyncedCount(): Promise<number> {
    if (isIOS) return 0
    if (!AutoSyncController.intialized) return 0
    return await RNFileScanner.getTotalCount('needs-sync')
  }

  /*
    Invoked on onScanStatus status 'FINISHED' or 'NO_SCAN
    Or when a file list (of max size = 25) gets uploaded
  */
  static async syncNextPage(page: number) {
    if (isIOS) return []
    if (!AutoSyncController.intialized) return []
    return await AutoSyncController.getNextToSyncPage(page)
  }

  /*
    Get next list of files (regardless of their status),
    But then filter based on status === 'needs-sync'.
    Loop through incoming data lists, until you get a list of size MAX_PAGE_SIZE
    of only files with status === 'needs-sync'
  */
  static async getNextToSyncPage(lastGlobalIndex: number): Promise<{ list: FileSync[]; lastGlobalIndex: number }> {
    if (isIOS) return { list: [], lastGlobalIndex: 0 }
    if (!AutoSyncController.intialized) return { list: [], lastGlobalIndex: 0 }
    let newLastGlobalIndex = lastGlobalIndex
    let list: FileSync[] = []
    let page = lastGlobalIndex === 0 ? 1 : Math.ceil((lastGlobalIndex + 1) / MAX_PAGE_SIZE)
    while (list.length < MAX_PAGE_SIZE) {
      // Fetch next page
      const response = await RNFileScanner.getFilesInDir({
        dirPath: '/DCIM/Camera/',
        sortBy: null,
        page,
      })
      if (response.data.length === 0) break

      // Update last index
      newLastGlobalIndex = response.end - 1 // TODO: Remove the (-1) next android version 1.1.8
      // if it's same page, then remove previously sent elements
      let data = response.data
      const indexDiff = newLastGlobalIndex - lastGlobalIndex
      if (indexDiff === 0) return { list: [], lastGlobalIndex }
      if (page === response.page && lastGlobalIndex !== 0) {
        // slice(-x) gets last x elements
        data = response.data.slice(-indexDiff)
      }

      list = list.concat(
        data
          // Only add files with 'needs-sync' status
          .filter(el => el.status === 'needs-sync'),
      )
      page++
    }
    return { list, lastGlobalIndex: newLastGlobalIndex }
  }
}
