import { launchImageLibrary, Asset, ImagePickerResponse, ErrorCode } from 'react-native-image-picker'
import { RNCamera, TakePictureOptions } from 'react-native-camera'
import RNBlobUtil, { ReactNativeBlobUtilStat } from 'react-native-blob-util'
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker'
import { geCameraUploadedFileName, getFileExtension } from './string'
import { FileUploadLiteType } from '@models/stores/models'
import { timeOut } from './date'
import { translate } from '@i18n'
import { getDocumentPath } from '@utils'

const BYTES_IN_MB = 1000000
const FILE_SIZE_LIMIT = BYTES_IN_MB * 100

const throwIfFileSizeExceedsLimit = (fileSize: number) => {
  if (fileSize > FILE_SIZE_LIMIT) {
    throw new Error(translate('file_uploads:size_limit'))
  }
}

export interface ImagePickerError {
  errorCode?: ErrorCode
  errorMessage?: string
}
/***********************/
/*    PHOTO GALLERY    */
/***********************/
export function launchImagePicker(): Promise<FileUploadLiteType[]> {
  const convertImageAssetToFileUpload = ({
    uri,
    fileSize,
    fileName,
    type,
    originalFileName,
  }: Asset): FileUploadLiteType => {
    throwIfFileSizeExceedsLimit(fileSize)
    return { path: uri.replace('file://', ''), size: fileSize, name: originalFileName ?? fileName, type }
  }

  return new Promise((resolve, reject) => {
    launchImageLibrary(
      { selectionLimit: 0, mediaType: 'photo', includeBase64: false },
      ({ didCancel, errorMessage, errorCode, assets }: ImagePickerResponse) => {
        if (!didCancel && !errorMessage) {
          try {
            console.log('ImagePickerResponse - results:', assets)
            const response = assets.map(convertImageAssetToFileUpload)
            resolve(response)
          } catch (error) {
            console.log('ImagePickerResponse - error:', error)
            const wrappedError: ImagePickerError = { errorCode: errorCode, errorMessage: error.message }
            reject(wrappedError)
          }
        } else resolve([])
      },
    )
  })
}

/***********************/
/*   CAMERA CAPTURE    */
/***********************/
export async function cameraCapture(camera: RNCamera): Promise<FileUploadLiteType> {
  const convertImageStatsToFileUpload = ({ path, size, filename, type }): FileUploadLiteType => {
    return { path, size, name: filename, type }
  }

  const { uri } = await camera.takePictureAsync({ quality: 0.5, base64: false } as TakePictureOptions)
  const stats: ReactNativeBlobUtilStat = await RNBlobUtil.fs.stat(uri.replace('file://', ''))
  const extension = getFileExtension(stats.filename)
  const newName = geCameraUploadedFileName()
  const fileName = `${newName}.${extension}`
  const mimeType = `image/${extension}`
  return convertImageStatsToFileUpload({ path: stats.path, size: stats.size, filename: fileName, type: mimeType })
}

/***********************/
/*      DOCUMENTS      */
/***********************/
export async function openDocumentPicker(): Promise<FileUploadLiteType[]> {
  const convertDocumentToFileUpload = ({ type, name, size, uri }: DocumentPickerResponse): FileUploadLiteType => {
    throwIfFileSizeExceedsLimit(size)
    // To fix errors where some iCloud files have a type of undefined
    const normalizedType = type === undefined ? 'file' : type
    return { name, path: uri, size, type: normalizedType }
  }

  try {
    const results: DocumentPickerResponse[] = await DocumentPicker.pickMultiple({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: true,
    })
    console.log('DocumentPickerResponse - results:', results)
    await timeOut(1)
    const formattedResults: FileUploadLiteType[] = []
    for (const result of results) {
      const info = await getDocumentPath(result.uri)
      result.uri = info?.path || result.uri
      formattedResults.push(convertDocumentToFileUpload(result))
    }
    return formattedResults
  } catch (error) {
    console.log('DocumentPickerResponse - error:', error)
    if (DocumentPicker.isCancel(error)) return []
    else throw error
  }
}
