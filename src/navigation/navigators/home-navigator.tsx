import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import {
  HomeScreen,
  DirectoryDetailsScreen,
  CameraCaptureScreen,
  MnemonicPhraseScreen,
  MnemonicVerifyScreen,
} from '@containers'
import { headerOptions } from '@theme'

const HomeStack = createNativeStackNavigator()
export function HomeStackNavigator({ route }) {
  const name = route.params?.name
  const path = route.params?.path || '/'
  return (
    <HomeStack.Navigator initialRouteName={'Home'} screenOptions={headerOptions}>
      <HomeStack.Screen name='Home' component={HomeScreen} />
      <HomeStack.Screen name='DirectoryDetails' component={DirectoryDetailsScreen} initialParams={{ path, name }} />
      <HomeStack.Screen name='CameraCapture' component={CameraCaptureScreen} />
      <HomeStack.Screen name='MnemonicPhrase' component={MnemonicPhraseScreen} />
      <HomeStack.Screen name='MnemonicVerify' component={MnemonicVerifyScreen} initialParams={{ lateBackup: true }} />
    </HomeStack.Navigator>
  )
}
