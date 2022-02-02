import React, { FunctionComponent } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text, Button, Loader } from '@components'
import Modal from 'react-native-modal'
import { translate } from '@i18n'
import styles from './styles'
import { color } from '@theme'

type Props = {
  isVisible?: boolean
  title?: string
  onPressNegative?: () => void
  onPressPositive?: () => void
  negativeButtonTitle?: string
  positiveButtonTitle?: string
  positiveButtonColor?: string
  loading?: boolean
  onClose?: () => void
  overRideOnPressPositive?: () => void
}

export const Confirmation: FunctionComponent<Props> = ({
  isVisible,
  title = translate('glossary:save_changes'),
  onPressNegative,
  onPressPositive,
  negativeButtonTitle = translate('common:cancel'),
  positiveButtonTitle = translate('common:save'),
  positiveButtonColor = color.primary,
  loading = false,
  onClose,
  overRideOnPressPositive,
}) => {
  function onPressPositivehadler() {
    if (overRideOnPressPositive) {
      overRideOnPressPositive()
      return
    }
    onClose()
    onPressPositive()
  }
  return (
    <Modal isVisible={isVisible} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {loading && (
          <View style={styles.loaderContainer}>
            <Loader isVisible={loading} />
          </View>
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={loading}
            style={styles.negativeBtnContainer}
            onPress={() => {
              onClose()
              if (onPressNegative) {
                onPressNegative()
              }
            }}>
            <Text style={styles.negativeBtnTitle}>{negativeButtonTitle}</Text>
          </TouchableOpacity>
          <Button
            disabled={loading}
            containerStyle={styles.positiveBtnContainer}
            nameStyle={styles.positiveBtnTitle}
            bgColor={positiveButtonColor}
            name={positiveButtonTitle}
            onPress={onPressPositivehadler}
          />
        </View>
      </View>
    </Modal>
  )
}
