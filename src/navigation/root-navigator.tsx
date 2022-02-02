/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a 'main' flow (which is contained in your MainNavigator) which the user
 * will use once logged in.
 */
import React from 'react'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { useStores } from '@models'
import { MainNavigator } from './navigators/main-navigator'
import { AuthStackNavigator } from './navigators/auth-navigator'
import { IntroStackNavigator } from './navigators/intro-navigator'
import { FileSyncOptionsStackNavigator } from './navigators/file-sync-navigator'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
const isIOS = Platform.OS === 'ios'
const disableSync = false

const RootSwitchNavigator = observer(() => {
  const {
    authStore: { user },
    generalStore: { userAppStatus },
  } = useStores()
  // TODO: Keep this removed until auto-sync actually lands
  if (userAppStatus === 'firstTimeSetup' && !disableSync) return <FileSyncOptionsStackNavigator />
  if (userAppStatus === 'firstTimeOpenApp') return <IntroStackNavigator />
  if (!user || userAppStatus === 'signInUp') return <AuthStackNavigator />
  return <MainNavigator />
})

const Container = isIOS ? React.Fragment : SafeAreaView
const makeRender = (props, ref) => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Container style={{ flex: 1 }}>
      <NavigationContainer {...props} ref={ref}>
        <RootSwitchNavigator />
      </NavigationContainer>
    </Container>
  )
}
export const RootNavigator = React.forwardRef<
  NavigationContainerRef,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  return makeRender(props, ref)
})
RootNavigator.displayName = 'RootNavigator'
