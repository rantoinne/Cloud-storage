import { translate, TxOptionsKeyPath, TxKeyPath } from '@i18n'
import { MenuType, MenuItem } from '@modals/popup-menu'

declare type MenuOptions = {
  type: MenuType
  items: MenuItem[]
}

const getOptionMenuItem = (
  identifier: TxOptionsKeyPath | string,
  icon?: { name: string; size?: number },
  tint?: string,
): MenuItem => {
  return {
    identifier,
    title: translate(`options:${identifier}` as TxKeyPath),
    icon: icon?.name ? { ...icon, size: icon?.size ?? 18 } : null,
    tint: tint,
  }
}

// const move = getOptionMenuItem('move', { name: 'move' })
// const addToStarred = getOptionMenuItem('add_to_starred', { name: 'star-inactive' })
const rename = getOptionMenuItem('rename', { name: 'pencil' })
const trash = getOptionMenuItem('delete', { name: 'trash' })
const privateShare = getOptionMenuItem('private_share', { name: 'private-share' })
const publicShare = getOptionMenuItem('public_share', { name: 'public-share' })
const download = getOptionMenuItem('download', { name: 'download' })
const name = getOptionMenuItem('name_uppercase')
const type = getOptionMenuItem('type')
const size = getOptionMenuItem('size')
const dateCreated = getOptionMenuItem('uploaded')
const takeAPhoto = getOptionMenuItem('take_photo', { name: 'camera' })
const uploadPhoto = getOptionMenuItem('upload_photo', { name: 'photo-upload' })
const createFolder = getOptionMenuItem('create_folder', { name: 'create-folder' })
const uploadFiles = getOptionMenuItem('upload_files', { name: 'file-upload' })
const moveTo = getOptionMenuItem('move_to', { name: 'move-to' })

export const editFolderOptions = (folderName: string, iconName = 'folder', iconSize = 18): MenuOptions => {
  return {
    type: MenuType.FolderOptions,
    items: [
      getOptionMenuItem(folderName, { name: iconName, size: iconSize }),
      // addToStarred,
      rename,
      trash,
    ],
  }
}

export const editFileOptions = (fileName: string, iconName: string, iconSize = 20): MenuOptions => {
  return {
    type: MenuType.FileOptions,
    items: [
      getOptionMenuItem(fileName, { name: iconName, size: iconSize }),
      privateShare,
      publicShare,
      // addToStarred,
      download,
      moveTo,
      rename,
      trash,
    ],
  }
}

export const sortByOptions = (currentSortBy, sortByOrder): MenuOptions => {
  const items = [
    getOptionMenuItem(translate('files:sort_by'), { name: 'filter', size: 14 }),
    name,
    type,
    size,
    dateCreated,
  ]
  if (currentSortBy) {
    items.forEach(item => {
      item.isCurrent = item.identifier === currentSortBy
      item.order = sortByOrder
    })
  }
  return {
    type: MenuType.SortBy,
    items,
  }
}

export const newFileOptions = (identifier?: string): MenuOptions => {
  return {
    type: MenuType.New,
    items: [getOptionMenuItem(identifier), takeAPhoto, uploadPhoto, uploadFiles, createFolder],
  }
}
