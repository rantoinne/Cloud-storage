```ts
declare type Config = {
	/* true => user wants all videos to be included as well */
  includeVideos: boolean
	/* true => include all photos */
  includeAllPhotos: boolean
	/* true => include only new photos */
	includeOnlyNewPhotos: boolean
	/* if null then user chooses to sync all photos */
	/* if number then user chooses to sync photos added after timestamp */
	syncPhotosFromDate: number | null
	/* All files user wants to sync */
	whitelistPaths: string[]
  hasStorageAccess: boolean
}
declare type FileStatus = 'no-sync' | 'needs-sync' | 'synced'
declare type SortBy = 'name' | 'type' | 'size' | 'date-created'
/* MimeType https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  Since there are too many of them even for the basic list,
  I won't cover all of them here, but the list provided in the url, should be our reference */
/* Mime types must be same for both platforms */
declare type FileMimeType = 'image/png' | 'application/pdf' | 'application/vnd.ms-excel'

/* file of type dir should always have size of 0 */
declare type FileType = {
  status: FileStatus
  path: string
	/* Has a value only if path updated(in case of rename or move)*/
	updatedPath: string | null
  type: MimeType
  size: number /* in bytes */
}
/* max (end - start) = max (page size) = 25 */
declare type FilePageList = {
  data: File[]
  start: number
  end: number
  totalSize: number
  page: number
}

/*
  All configuration and permissions should be created from RN side and sent to the native
  side on initialization and if updated/changed.
*/
/* init should automatically start syncing all the files that have 'failed' for status */
declare function init(config: Config): Promise<boolean>
declare function setConfig(config: Config): Promise<boolean>
/* Directories should be listed first, if sortBy 'date-created' or 'name'  */
declare function getFilesInDir(page: number, dirPath: string, sortBy: SortBy, searchText?: string): Promise<FilePageList>
```


# SDK Library expected services

Scan local filesystem on application on first install based on provided permission
Listen to and capture any changes for any files in the file system, and update the local database with the changes.
All files info need to be saved in a local DB, and kept up to date

### Changes include:

deleted: if file is **deleted** completely
moved: if file got **moved** from one directory to another or **renamed** in same directory or another
added: if a new file got **added**
edited: if file's contents **changed** (checksum algorithm must be same for both platforms)

Changes in filesystem should be captured automatically without any help from the application side.