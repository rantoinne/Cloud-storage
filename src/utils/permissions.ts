import { Platform } from 'react-native'
import { PERMISSIONS, check, request } from 'react-native-permissions'
import { ios } from './device'

const androidPermission = Object.freeze({
  camera: PERMISSIONS.ANDROID.CAMERA,
  photo:
    Platform.OS === 'android' && Platform.Version >= 30
      ? PERMISSIONS.ANDROID.MANAGE_EXTERNAL_STORAGE
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  readExternalStorage: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
})

const iosPermission = Object.freeze({
  camera: PERMISSIONS.IOS.CAMERA,
  photo: PERMISSIONS.IOS.PHOTO_LIBRARY,
  media: PERMISSIONS.IOS.MEDIA_LIBRARY,
})

export const RESULTS = Object.freeze({
  LIMITED: 'limited',
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  GRANTED: 'granted',
})

type Values<T extends { [x: string]: string }> = T[keyof T]

export type AndroidPermission = Values<typeof androidPermission>
export type IOSPermission = Values<typeof iosPermission>
export type Permission = AndroidPermission | IOSPermission
export type PermissionStatus = Values<typeof RESULTS>

/* CAMERA ACCESS */
const cameraPermissionKey = ios ? iosPermission.camera : androidPermission.camera
export async function checkCameraAccess(): Promise<PermissionStatus> {
  return check(cameraPermissionKey)
}
export async function requestCameraAccess(): Promise<PermissionStatus> {
  return request(cameraPermissionKey)
}
export async function hasCameraAccess(): Promise<boolean> {
  const result = await check(cameraPermissionKey)
  return result === RESULTS.LIMITED || result === RESULTS.GRANTED
}

/* PHOTO ACCESS */
const photoPermissionKey = ios ? iosPermission.photo : androidPermission.photo
export async function checkPhotoAccess(): Promise<PermissionStatus> {
  const result = await check(photoPermissionKey)
  return result
}
export async function requestPhotoAccess(): Promise<PermissionStatus> {
  const result = await request(photoPermissionKey)
  return result
}
export async function hasPhotoAccess(): Promise<boolean> {
  const result = await checkPhotoAccess()
  return ios ? result === RESULTS.LIMITED || result === RESULTS.GRANTED : result === RESULTS.GRANTED
}

export async function requestReadExternalStorageAccess(): Promise<PermissionStatus | undefined> {
  if (!ios) {
    const result = await request(androidPermission.photo)
    return result
  }
  return undefined
}

export async function hasReadExternalStorageAccess(): Promise<boolean> {
  if (!ios) {
    const result = await requestReadExternalStorageAccess()
    return result === RESULTS.GRANTED
  }
  return true
}
