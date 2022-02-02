import ToastBase from 'react-native-toast-message'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { Platform, NativeModules } from 'react-native'
import { openSettings } from 'react-native-permissions'
import { hasPhotoAccess, requestPhotoAccess, RESULTS } from '@utils'
const { RNMail } = NativeModules

const logsArr = []

console.log = (function () {
  var orig = console.log
  return function () {
    try {
      var tmp = process.stdout
      process.stdout = process.stderr
      orig.apply(console, arguments)
      addLog(arguments)
    } finally {
      process.stdout = tmp
    }
  }
})()

const addLog = arrArgu => {
  var logStr = '[' + getTime() + ']'
  for (const index in arrArgu) {
    logStr += ' '
    logStr += arrArgu[index] instanceof Object ? JSON.stringify(arrArgu[index]) : arrArgu[index]
  }
  logsArr.push(logStr)
  return logStr
}

const getTime = () => {
  const d = new Date()
  const dd = [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()].map(a => (a < 10 ? '0' + a : a))
  return dd.join(':')
}

console.sendLogs = async () => {
  if (!(await hasPhotoAccess()) && !(await requestPhotoAccessPermission())) return 

  var path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/opacity-app-log.txt`
  const deviceInfo = {}
  if ( Platform.OS === 'android') {
    deviceInfo.System = 'Android'
    deviceInfo.Version = Platform.Version
    deviceInfo.Model = Platform.Model
    deviceInfo.Brand = Platform.Brand
    deviceInfo.Manufacturer = Platform.Manufacturer
  } else {
    deviceInfo.System = 'iOS'
    deviceInfo.osVersion = Platform.osVersion
    deviceInfo.systemName = Platform.systemName
  }
  var logs = `Device Info: ${JSON.stringify(deviceInfo)}`
  logs+=logsArr.join('\n')

  // write the file
  ReactNativeBlobUtil.fs
    .writeFile(path, logs, 'utf8')
    .then(success => {
      console.log('FILE WRITTEN!')
    })
    .catch(err => {
      console.log(err.message)
    })

    RNMail.mail(
    {
      subject: 'User Submitted Logs',
      recipients: ['info@opacity.io'],
      body: `Team, I'm submitting some logs for review as I'm having a few issues with {fill out}`,
      isHTML: true,
      attachments: [
        {
          path: path, // The absolute path of the file from which to read data.
          mimeType: 'text/plain', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        },
      ],
    },
    (error, event) => {
      if (error) {
        console.log('Error', error)
      }
    },
  )

}


const requestPhotoAccessPermission = () => {
  return new Promise(async resolve => {
    const status = await requestPhotoAccess()
    switch (status) {
      case RESULTS.LIMITED:
      case RESULTS.GRANTED: {
        resolve(true)
        break
      }
      case RESULTS.BLOCKED: {
        toastPermissionNeeded()
        openSettings()
        break
      }
      case RESULTS.DENIED: {
        toastPermissionNeeded()
        resolve(false)
        break
      }
      default:
        break
    }
  })
}
const toastPermissionNeeded = () => {
  ToastBase.show({
    type: 'info',
    position: 'bottom',
    text2: 'Permission needed to save logs!',
    visibilityTime: 2000,
    autoHide: true,
    bottomOffset: 75,
  })
}