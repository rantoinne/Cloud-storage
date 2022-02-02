import { formatTimeOfDay } from './date'
import { ios } from '@utils/device'
import ReactNativeBlobUtit from 'react-native-blob-util'

export const getFileExtension = (fileName?: string): string => fileName.split('.').pop() ?? null
export const getFileNameWithoutExtension = (fileName?: string): string => fileName?.split('.')[0] ?? null

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function geCameraUploadedFileName() {
  const date = new Date()
  const day = date.getDate()
  const year = date.getFullYear()
  const time = `${formatTimeOfDay(date, true, true, '-')}`
  const fileName = `camera-upload-${date.getMonth()}-${day}-${year}-${time}`
  // remove whitespace
  return fileName.replace(/\s+/g, '')
}

export function toUpperCaseFirstLetter(val: string) {
  return val[0].toUpperCase() + val.substr(1, val.length - 1)
}

export function truncateString(str, num) {
  if (str.length > num + 3) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

export function isEmpty(val?: string) {
  return val != null && val !== ''
}

export function slash(path: string) {
  return path[path.length - 1] === '/' ? '' : '/'
}

export function getUri(path, name): string {
  return `${path}${slash(path)}${name}`
}

export function getPrevPath(path): string {
  function _getPrevPath() {
    const splitPath = path.split('/')
    splitPath.splice(splitPath.length - 1, 1)
    return splitPath.join('/')
  }
  return path === '/' ? '/' : _getPrevPath()
}

export function getDirNameFromPath(path): string {
  if (path === '/') {
    return ''
  }

  const folderPaths = path.split('/')
  return folderPaths[folderPaths.length - 1]
}

export async function getDocumentPath(uri: string, name) {
  if (uri.startsWith('content://')) {
    if (!ios) {
      const relativePath = ReactNativeBlobUtit.fs.dirs.CacheDir
      return `${relativePath}/${name}`
    }
  }
  return undefined
}
