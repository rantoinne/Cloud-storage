import React from 'react'
import { Image, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStores } from '@models'
import { Button, Screen, Text, Logo } from '@components'
import { congrats } from '@images'
import { translate } from '@i18n'
import styles from './styles'

export const AccountCreateSuccessScreen = observer(() => {
  const {
    generalStore: { setUserAppStatus },
  } = useStores()

  return (
    <>
      <Screen style={styles.container}>
        <View style={styles.topSection}>
          <Logo />
          <Image source={congrats} style={styles.image} />
          <Text style={styles.header}>{translate('account_create:congratulations')}</Text>
          <Text style={styles.subheader}>{translate('account_create:lets_upload')}</Text>
        </View>
        <View>
          <Button
            onPress={() => setUserAppStatus('firstTimeSetup')}
            name={translate('account_create:lets_go').toUpperCase()}
          />
        </View>
      </Screen>
    </>
  )
})
