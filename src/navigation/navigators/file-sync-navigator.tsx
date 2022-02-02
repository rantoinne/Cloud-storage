import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { FileSyncOptionsScreen, CameraUploadsConfigurationsScreen, BackupConfigurationScreen } from '@containers'
import { headerOptions } from '@theme'

const IntroStack = createNativeStackNavigator()
export function FileSyncOptionsStackNavigator() {
  return (
    <IntroStack.Navigator initialRouteName={'FileSyncOptions'} screenOptions={headerOptions}>
      <IntroStack.Screen name='FileSyncOptions' component={FileSyncOptionsScreen} />
      <IntroStack.Screen name='CameraUploadsConfig' component={CameraUploadsConfigurationsScreen} />
      <IntroStack.Screen name='BackupConfig' component={BackupConfigurationScreen} />
    </IntroStack.Navigator>
  )
}
