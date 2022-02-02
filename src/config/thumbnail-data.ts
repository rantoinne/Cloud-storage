const typeExtensionMatchList = {
  image: [
    'png',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/vnd.microsoft.icon',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
  ],
  video: [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/mp2t',
    'video/webm',
    'video/3gpp',
    'video/3gpp2',
    'video/x-msvideo',
  ],
  pdf: ['application/pdf', 'pdf'],
  doc: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'doc', 'docx'],
  xls: ['application/vnd.ms-excel', 'text/csv', 'xls', 'xlsx', 'xlsm', 'xltx'],
  zip: [
    'application/x-zip-compressed',
    'application/zip',
    'application/x-tar',
    'application/vnd.rar',
    'tar',
    'zip',
    'tgz',
  ],
}

const extensionTypeDict = Object.entries(typeExtensionMatchList).reduce((acc, [key, extensions]) => {
  extensions.forEach(ext => {
    acc[ext] = key
  })
  return acc
}, {})

/* return thumbnail according to the extension of the file */
export const getThumbnail = (isDir: boolean, type: string) => {
  if (isDir) return 'folder'
  return extensionTypeDict[type] || 'unsupported'
}
