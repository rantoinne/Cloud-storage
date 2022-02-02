import '@i18n'
import React, { useState, useEffect, useRef } from 'react'
import { AppState, UIManager, Platform } from 'react-native'
import { NavigationContainerRef } from '@react-navigation/native'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import SplashScreen from 'react-native-splash-screen'
import { toastConfig, StatusBar } from '@components'
import * as Storage from '@utils/storage'
import { useBackButtonHandler, RootNavigator, canExit, setRootNavigation, useNavigationPersistence } from '@navigation'
import { RootStore, RootStoreProvider, setupRootStore } from '@models'
import * as Sentry from '@sentry/react-native'
import { SENTRY_DSN, SENTRY_STAGE } from '@env'
// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator
import { enableScreens } from 'react-native-screens'

enableScreens(true)

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.BrowserIntegrations.Breadcrumbs({
      dom: false,
    }),
  ],
  environment: SENTRY_STAGE,
})

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false)
}

/**
 * This is the root component of our app.
 */
function App() {
  const appState = useRef(AppState.currentState)
  const navigationRef = useRef<NavigationContainerRef>(null)
  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined)
  setRootNavigation(navigationRef)
  useBackButtonHandler(navigationRef, canExit)
  const { initialNavigationState, onNavigationStateChange } = useNavigationPersistence(
    Storage,
    NAVIGATION_PERSISTENCE_KEY,
  )

  function backFromBgListener(nextAppState) {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      rootStore?.uploaderStore.autoSync.startAutoSync().then(() => {
        rootStore.uploaderStore.startUploading()
      })
    }
    appState.current = nextAppState
  }

  const addEventBackFromBgListener = () => {
    AppState.addEventListener('change', backFromBgListener)
    return () => AppState.removeEventListener('change', backFromBgListener)
  }

  const signInUser = async store => {
    if (store.authStore.handle) {
      await store.authStore.signIn(store.authStore.handle)
    }
  }

  // Kick off initial async loading actions, like loading fonts and RootStore
  useEffect(() => {
    ;(async () => {
      // Load everything here first
      const store = await setupRootStore()
      store.resetLoadingError()
      await signInUser(store)
      setRootStore(store)
      addEventBackFromBgListener()
      SplashScreen.hide()
    })()
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color. You can replace
  // with your own loading component if you wish.
  if (!rootStore) return null

  // otherwise, we're ready to render the app
  return (
    <>
      <StatusBar />
      <RootStoreProvider value={rootStore}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <RootNavigator
            ref={navigationRef}
            initialState={__DEV__ ? initialNavigationState : undefined}
            onStateChange={__DEV__ ? onNavigationStateChange : undefined}
          />
        </SafeAreaProvider>
      </RootStoreProvider>
      <Toast config={toastConfig} ref={ref => Toast.setRef(ref)} />
    </>
  )
}

export default Sentry.wrap(App)
