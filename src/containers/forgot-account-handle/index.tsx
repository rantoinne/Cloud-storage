import React, { useEffect, useState } from 'react'
import { useStores } from '@models'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { Button, TextArea, Screen, Text, Header } from '@components'
import styles from './styles'
import { translate } from '@i18n'

export const ForgotAccountHandleScreen = observer(() => {
  const [mnemonic, setMnemonic] = useState<string>()
  const [error, setError] = useState<string>()
  const navigation = useNavigation()
  const {
    authStore: { recoverHandle, recoverHandleLoading, recoverHandleError, handle },
  } = useStores()

  useEffect(() => {
    if (!mnemonic || recoverHandleLoading) return
    if (!recoverHandleError && handle) {
      navigation.navigate('SignIn', { handle: handle })
    } else {
      setError(translate('forgot_account:incorrect_recovery'))
    }
  }, [recoverHandleLoading])

  useEffect(() => {
    if (error) setError(null)
  }, [mnemonic])

  const handlePressRecover = () => {
    setError(null)
    const mnemonicList = mnemonic?.split(' ') || []
    if (mnemonicList.length === 12) {
      recoverHandle(mnemonicList)
    } else {
      setError(translate('forgot_account:mnemonic_length_error'))
    }
  }

  return (
    <>
      <Header navigation={navigation} title={'Forgot account handle'} />
      <Screen>
        <Text style={styles.title}>{translate('forgot_account:recover_account')}</Text>
        <Text style={styles.text}>{translate('forgot_account:recovery_instructions_1')}</Text>
        <Text style={styles.text}>{translate('forgot_account:recovery_instructions_2')}</Text>
        <TextArea
          title={translate('forgot_account:recover_phrase')}
          placeholder={translate('forgot_account:type_here')}
          marginTop={20}
          value={mnemonic}
          onChangeValue={text => {
            setMnemonic(text.toLowerCase())
          }}
        />
        <Button
          name={translate('forgot_account:recover_account').toUpperCase()}
          onPress={handlePressRecover}
          loading={recoverHandleLoading}
          marginTop={20}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Screen>
    </>
  )
})
