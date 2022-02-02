import React, { useState, useMemo } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Screen, Text, PhraseSelector, Logo, Header } from '@components'
import { getRandomPhrases, PhraseData } from '@utils'
import { useStores } from '@models'
import { translate } from '@i18n'
import styles from './styles'

export const MnemonicVerifyScreen = observer(() => {
  const { params } = useRoute<RouteParams>()
  const navigation = useNavigation()
  const {
    authStore: { mnemonic },
  } = useStores()
  const phrasesVerify = useMemo<PhraseData[]>(() => getRandomPhrases(mnemonic), [mnemonic])
  const [selected, setSelected] = useState(Array(4).fill(false))
  const [error, setError] = React.useState<string>()
  const {
    generalStore: { setBackupMnemonicStatus },
  } = useStores()
  const showAgainTranslate = translate('mnemonic_verify:show_again')

  const handleItemSelect = (index: number, isCorrect: boolean) => {
    setError(null)
    setSelected(_selected => {
      _selected[index] = isCorrect
      return [..._selected]
    })
  }

  const handleConfirm = () => {
    const isCorrect = selected.every(d => !!d)
    if (!isCorrect) {
      setError(translate('mnemonic_verify:wrong_phrases'))
    } else {
      setBackupMnemonicStatus('backedUp')
      navigateForSkipOrSuccess()
    }
  }

  const navigateForSkipOrSuccess = () => {
    if (params?.lateBackup) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } else {
      navigation.navigate('AccountCreateSuccess')
    }
  }

  return (
    <>
      <Header navigation={navigation} isTransparent={true} />
      <Screen style={styles.container}>
        <Logo />
        <Text style={styles.header}>{translate('mnemonic_verify:title')}</Text>
        <Text style={styles.subheader}>{translate('mnemonic_verify:recover_phrase')}</Text>
        <View style={styles.phrasesContainer}>
          {phrasesVerify.map((el, index) => (
            <PhraseSelector
              key={el.correct}
              title={`${translate('mnemonic_verify:select_word')} # ${el.position + 1}`}
              phrases={el.words}
              correctPhrase={el.correct}
              onItemSelect={isCorrect => handleItemSelect(index, isCorrect)}
              marginTop={14}
            />
          ))}
        </View>
      </Screen>
      <SafeAreaView style={styles.bottomSection}>
        <Text style={styles.skip_text} onPress={navigateForSkipOrSuccess}>
          {translate('mnemonic_verify:skip_now')}
        </Text>
        {!!error && <Text style={styles.error_text}>{error}</Text>}
        <Button onPress={handleConfirm} name={translate('confirm').toUpperCase()} marginTop={15} />
        <Text style={styles.subtitle}>
          {showAgainTranslate[0]}
          <Text onPress={() => navigation.goBack()}>{showAgainTranslate[1]}</Text>
        </Text>
      </SafeAreaView>
    </>
  )
})
