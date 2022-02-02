import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { CarouselScreen, GetStartedScreen } from '@containers'
import { headerOptions } from '@theme'

const IntroStack = createNativeStackNavigator()
export function IntroStackNavigator() {
  return (
    <IntroStack.Navigator initialRouteName={'Carousel'} screenOptions={headerOptions}>
      <IntroStack.Screen name='Carousel' component={CarouselScreen} />
      <IntroStack.Screen name='GetStarted' component={GetStartedScreen} />
    </IntroStack.Navigator>
  )
}
