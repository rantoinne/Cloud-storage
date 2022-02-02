import React from 'react'
import { View, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { Text, Logo, ButtonWhiteBlueBorder } from '@components'
import { translate } from '@i18n'
import { rocket } from '@images'
import { useStores } from '@models'
import styles from './styles'

export const GetStartedScreen = observer(() => {
  const {
    generalStore: { setUserAppStatus },
  } = useStores()

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Logo />
      </View>
      <View style={styles.bottomContainer}>
        <ImageBackground resizeMode='stretch' style={styles.imageCover} source={rocket}>
          <View style={styles.internalImageContainer}>
            <SafeAreaView style={styles.safeAreaView}>
              <ButtonWhiteBlueBorder
                name={translate('get_started:getStarted')}
                onPress={() => setUserAppStatus('signInUp')}
                containerStyle={styles.button}
                marginTop={8}
              />
            </SafeAreaView>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{translate('get_started:title')}</Text>
              <Text style={styles.description}>{translate('get_started:description')}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  )
})
