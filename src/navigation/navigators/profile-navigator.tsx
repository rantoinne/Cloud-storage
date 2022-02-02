import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import {
  ProfileScreen,
  PrivacyPolicyScreen,
  TermsAndConditionsScreen,
  CameraUploadsConfigurationsScreen,
  BackupConfigurationScreen,
  AboutScreen,
  DirectoryDetailsScreen,
  CameraCaptureScreen,
  MoveFilesAndFoldersScreen,
} from '@containers'
import { headerOptions } from '@theme'
import { HelpCenterScreen } from '@containers/help-center'

const ProfileStack = createNativeStackNavigator()
export function ProfileStackNavigator({ route, params }) {
  const name = route.params?.name
  const path = route.params?.path
  const fallBackPath = route.params?.fallBackPath
  const fallBackNavigator = route.params.fallBackNavigator
  const showFolderName = route.params.showFolderName
  return (
    <ProfileStack.Navigator initialRouteName={'Profile'} screenOptions={headerOptions}>
      <ProfileStack.Screen name='Profile' component={ProfileScreen} />
      <ProfileStack.Screen name='About' component={AboutScreen} />
      <ProfileStack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} />
      <ProfileStack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name='HelpCenter' component={HelpCenterScreen} />
      <ProfileStack.Screen name='CameraUploadsConfig' component={CameraUploadsConfigurationsScreen} />
      <ProfileStack.Screen name='BackupConfig' component={BackupConfigurationScreen} />
      <ProfileStack.Screen name='DirectoryDetails' component={DirectoryDetailsScreen} initialParams={{ path, name }} />
      <ProfileStack.Screen
        name='MoveFilesAndFolders'
        component={MoveFilesAndFoldersScreen}
        initialParams={{ path, fallBackPath, showFolderName, fallBackNavigator }}
      />
      <ProfileStack.Screen name='CameraCapture' component={CameraCaptureScreen} />
    </ProfileStack.Navigator>
  )
}
