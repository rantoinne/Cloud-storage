if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

/* eslint-disable import/first */
import 'node-libs-react-native/globals'
import 'react-native-get-random-values'
import 'fastestsmallesttextencoderdecoder'
import './jsLogger'
global.process.version = 'v14.17.1'

import App from './src/app.tsx'
import { AppRegistry, LogBox, Text, TextInput } from 'react-native'

LogBox.ignoreAllLogs(true)

AppRegistry.registerComponent('opacity', () => App)

// TODO: Disabling adaptive text until the app actually supports it
Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

TextInput.defaultProps = Text.defaultProps || {}
TextInput.defaultProps.allowFontScaling = false

export default App
