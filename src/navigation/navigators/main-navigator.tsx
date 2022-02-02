import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FilesStackNavigator } from './files-navigator'
import { HomeStackNavigator } from './home-navigator'
import { SvgIcon } from '@components'
import { color, family, headerOptions } from '@theme'
import { ios } from '@utils/device'
import { ProfileScreen, ManageFilesScreen } from '@containers'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { ProfileStackNavigator } from './profile-navigator'
const tabBarIcon = ({ navigation, route, focused }) => {
  return (
    <SvgIcon
      name={`${(route.name as string).toLowerCase()}${focused ? '-focused' : ''}`}
      size={24}
      onPress={() => navigation.navigate(route.name)}
    />
  )
}

const Tab = createBottomTabNavigator()
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={({ navigation, route }) => ({
        tabBarIcon: ({ focused }) => tabBarIcon({ navigation, route, focused }),
      })}
      tabBarOptions={{
        safeAreaInsets: !ios
          ? {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }
          : null,
        activeTintColor: color.primary,
        inactiveTintColor: color.palette.lightGray,
        labelStyle: {
          fontFamily: family.PoppinsRegular,
          fontSize: 12,
          bottom: 0,
        },
        iconStyle: {
          marginTop: 6,
        },
        style: {
          borderTopWidth: 0.25,
          shadowColor: color.palette.black,
          shadowOffset: {
            width: 1,
            height: 12,
          },
          shadowOpacity: 0.16,
          shadowRadius: 20,
          elevation: 12,
        },
      }}>
      <Tab.Screen name='Home' component={HomeStackNavigator} />
      <Tab.Screen name='Files' component={FilesStackNavigator} initialParams={{ starred: false }} />
      {/* <Tab.Screen name='Starred' component={FilesStackNavigator} initialParams={{ starred: true }} /> */}
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  )
}
const Stack = createNativeStackNavigator()
export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name='Main' component={MainTabNavigator} />
      <Stack.Screen name='SubMain' component={ProfileStackNavigator} />
      <Stack.Screen name='ManageFiles' component={ManageFilesScreen} />
    </Stack.Navigator>
  )
}

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = []
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
