import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { DirectoryDetailsScreen, CameraCaptureScreen } from '@containers'
import { headerOptions } from '@theme'

const FilesStack = createNativeStackNavigator()
export function FilesStackNavigator({ route }) {
  const isStarred = route.name === 'Starred'
  return (
    <FilesStack.Navigator initialRouteName={'Files'} screenOptions={headerOptions}>
      <FilesStack.Screen
        name='DirectoryDetails'
        component={DirectoryDetailsScreen}
        initialParams={{ path: '/', starred: isStarred }}
      />
      <FilesStack.Screen name='CameraCapture' component={CameraCaptureScreen} />
    </FilesStack.Navigator>
  )
}
