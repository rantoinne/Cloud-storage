import React, { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import Clipboard from '@react-native-community/clipboard'
import { translate } from '@i18n'
import { Button, TextInput, Checkbox, Screen, Text, Logo, LinkButton, Header, Loader } from '@components'
import { useStores } from '@models'
import styles from './styles'

export const SignUpScreen = observer(() => {
  const navigation = useNavigation()
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedTextVisible, setCopiedTextVisible] = useState(false)
  const {
    authStore: { handle, createHandle, signUp, signUpLoading, signUpError, createHandleLoading },
  } = useStores()

  useEffect(() => {
    createHandle()
  }, [])

  useEffect(() => {
    if (!copiedToken) return
    setCopiedTextVisible(true)
    setTimeout(() => setCopiedTextVisible(false), 1500)
  }, [copiedToken])

  useEffect(() => {
    if (signUpLoading || !handle || !copiedToken) return
    if (!signUpError) {
      navigation.navigate('MnemonicPhrase')
    } else Alert.alert(signUpError)
  }, [signUpLoading])

  const renderCheckboxDescription = () => {
    const [agree, tos, and, policy] = translate('sign_up:toa')
    return (
      <View style={styles.checkBoxDescriptionContainer}>
        <Text style={styles.checkBoxText}>{agree}</Text>
        <LinkButton title={tos} titleStyle={styles.link} onPress={() => navigation.navigate('TermsAndConditions')} />
        <Text style={styles.checkBoxText}>{and}</Text>
        <LinkButton title={policy} titleStyle={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')} />
      </View>
    )
  }

  const handleCopyClipboard = () => {
    Clipboard.setString(handle)
    setCopiedToken(true)
  }

  return (
    <>
      <Header navigation={navigation} isTransparent={true} />
      <Loader isVisible={createHandleLoading} />
      <Screen style={styles.contentContainer}>
        <Logo />
        <Text style={styles.header}>{translate('sign_up:get_started')}</Text>
        <Text style={styles.subheader}>{translate('sign_up:privacy_and_security')}</Text>
        <TextInput
          numberOfLines={1}
          disabled
          editable={false}
          defaultValue={handle}
          underlineColorAndroid='transparent'
          marginTop={30}
        />
        <Text style={styles.subtitle}>{translate('sign_up:dont_share_handle')}</Text>

        {!copiedToken && (
          <View style={styles.checkBoxContainer}>
            <Checkbox defaultValue={false} onChangeValue={setAgreeToTerms} containerStyle={styles.checkBox} />
            {renderCheckboxDescription()}
          </View>
        )}

        {!copiedToken ? (
          <Button
            disabled={!agreeToTerms}
            onPress={handleCopyClipboard}
            name={translate('sign_up:copy_account_handle').toUpperCase()}
            marginTop={14}
          />
        ) : (
          <Button
            disabled={!agreeToTerms}
            onPress={() => signUp()}
            name={translate('sign_up:create_account').toUpperCase()}
            loading={signUpLoading}
            marginTop={14}
          />
        )}
        {copiedTextVisible && <Text style={styles.copiedText}>{translate('sign_up:copied')}</Text>}
      </Screen>
    </>
  )
})
