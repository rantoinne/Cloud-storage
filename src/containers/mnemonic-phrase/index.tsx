import React, { useLayoutEffect } from 'react'
import { View, ScrollView } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { Button, Phrase, Screen, Text, Logo, Header } from '@components'
import { translate } from '@i18n'
import styles from './styles'
import { useStores } from '@models'
import { SafeAreaView } from 'react-native-safe-area-context'

export const MnemonicPhraseScreen = observer(() => {
  const navigation = useNavigation()
  const {
    authStore: { mnemonic },
  } = useStores()
  const phrasesNum = mnemonic.map((el, i) => `${i + 1}. ${el}`)
  const phrasesLeft = phrasesNum.filter((_, i) => i % 2 === 0)
  const phrasesRight = phrasesNum.filter((_, i) => i % 2 !== 0)

  const setTabBarVisible = (isVisible = true) =>
    navigation.dangerouslyGetParent()?.setOptions({
      tabBarVisible: isVisible,
    })

  useLayoutEffect(() => {
    setTabBarVisible(false)
    return () => setTabBarVisible()
  }, [])

  return (
    <>
      <Header navigation={navigation} isTransparent={true} />
      <Screen style={styles.container} scrollEnabled={true}>
        <Logo />
        <Text style={styles.header}>{translate('mnemonic_phrase:title')}</Text>
        <Text style={styles.subtitle}>{translate('mnemonic_phrase:dont_forget_handle')}</Text>
        <Text style={styles.subheader}>{translate('mnemonic_phrase:keep_safe')}</Text>
        <ScrollView contentContainerStyle={styles.phrasesContainer}>
          <View style={styles.phrasesColContainer}>
            {phrasesLeft.map(phrase => (
              <Phrase key={phrase} name={phrase} />
            ))}
          </View>
          <View style={styles.phrasesColContainer}>
            {phrasesRight.map(phrase => (
              <Phrase key={phrase} name={phrase} />
            ))}
          </View>
        </ScrollView>
      </Screen>
      <SafeAreaView style={styles.bottomContainer}>
        <View style={styles.paddingHorizontal}>
          <Button onPress={() => navigation.navigate('MnemonicVerify')} name={translate('next').toUpperCase()} />
          <Text style={[styles.subtitle, styles.doNotShare]}>{translate('mnemonic_phrase:dont_share')}</Text>
        </View>
      </SafeAreaView>
    </>
  )
})
