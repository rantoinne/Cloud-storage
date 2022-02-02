import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import {
  SignInScreen,
  SignUpScreen,
  ForgotAccountHandleScreen,
  MnemonicPhraseScreen,
  MnemonicVerifyScreen,
  AccountCreateSuccessScreen,
  TermsAndConditionsScreen,
  PrivacyPolicyScreen,
} from '@containers'
import { headerOptions } from '@theme'

const AuthStack = createNativeStackNavigator()
export function AuthStackNavigator() {
  return (
    <AuthStack.Navigator initialRouteName={'SignIn'} screenOptions={headerOptions}>
      <AuthStack.Screen name='SignIn' component={SignInScreen} />
      <AuthStack.Screen name='SignUp' component={SignUpScreen} />
      <AuthStack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} />
      <AuthStack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
      <AuthStack.Screen name='ForgotAccountHandle' component={ForgotAccountHandleScreen} />
      <AuthStack.Screen name='MnemonicPhrase' component={MnemonicPhraseScreen} />
      <AuthStack.Screen name='MnemonicVerify' component={MnemonicVerifyScreen} />
      <AuthStack.Screen name='AccountCreateSuccess' component={AccountCreateSuccessScreen} />
    </AuthStack.Navigator>
  )
}
