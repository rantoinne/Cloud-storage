import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import validate from 'validate.js'
import { translate } from '@i18n'
import { useStores } from '@models'
import { Button, ButtonWhiteBlueBorder, TextInput, Screen, Text, Logo } from '@components'
import { signInSchema } from '@config'
import { HANDLE } from '@env'
import styles from './styles'

export const SignInScreen = observer(() => {
  const { params } = useRoute<RouteParams>()
  const navigation = useNavigation()
  const {
    authStore: { signIn, signInLoading, signInError },
  } = useStores()
  const [handle, setHandle] = useState<string>(params?.handle)
  const [error, setError] = useState<string>()

  const _setHandle = val => {
    setHandle(val)
    error && setError(null)
  }

  useEffect(() => {
    setHandle(params?.handle)
  }, [params])

  useEffect(() => {
    if (!params?.handle && __DEV__) setHandle(HANDLE)
  }, [])

  useEffect(() => {
    if (!handle || signInLoading) return
    if (signInError) {
      setError(signInError)
    }
  }, [signInLoading])

  const validateInputs = () => {
    const newErrors = validate({ handle }, signInSchema, { format: 'flat' })
    setError(newErrors ? newErrors[0] : null)
    return newErrors
  }

  const handlePressSignIn = () => {
    if (!validateInputs()) {
      signIn(handle)
    }
  }

  const renderOr = () => (
    <View style={styles.orContainer}>
      <View style={styles.line} />
      <Text style={styles.orText}>{translate('or')}</Text>
      <View style={styles.line} />
    </View>
  )

  return (
    <Screen style={styles.contentContainer} keyboardShouldPersistTaps='handled'>
      <Logo />
      <Text style={styles.header}>{translate('sign_in:welcome')}</Text>
      <Text style={styles.subheader}>{translate('sign_in:privacy_hands')}</Text>
      <TextInput
        defaultValue={handle}
        onChangeValue={_setHandle}
        placeholder={translate('sign_in:enter_account')}
        underlineColorAndroid='transparent'
        marginTop={30}
        error={error}
      />
      <Button
        loading={signInLoading}
        onPress={handlePressSignIn}
        name={translate('sign_in:login').toUpperCase()}
        marginTop={error ? 32 : 24}
      />
      <Text style={styles.link} onPress={() => navigation.navigate('ForgotAccountHandle')}>
        {translate('sign_in:forgot_account')}
      </Text>
      {renderOr()}
      <ButtonWhiteBlueBorder
        onPress={() => navigation.navigate('SignUp')}
        name={translate('sign_in:create_account').toUpperCase()}
        marginTop={16}
      />
    </Screen>
  )
})
