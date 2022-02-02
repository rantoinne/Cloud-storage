import React, { FunctionComponent } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '@components'
import Modal from 'react-native-modal'
import { translate } from '@i18n'
import styles from './styles'

type Props = {
  modalVisible?: boolean
  title?: string
  onPressNegative?: () => void
  negativeButtonTitle?: string
  onPressItem?: (index: number) => void
  items: string[]
  onClose?: () => void
}

export const ConfirmationAlert: FunctionComponent<Props> = ({
  modalVisible,
  title,
  onPressNegative,
  negativeButtonTitle,
  onPressItem,
  items = [],
  onClose,
}) => {
  const renderItems = () => {
    return items.map((item, key) => renderItem(item, key))
  }

  const renderItem = (name: string, key: number) => {
    return (
      <View style={styles.itemContainer} key={key}>
        <TouchableOpacity
          onPress={() => {
            onClose()
            onPressItem(key)
          }}>
          <Text style={styles.itemText}>{name}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderNegativeItem = () => {
    return (
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          onClose()
          onPressNegative()
        }}>
        <Text style={styles.negativeText}>{negativeButtonTitle ?? translate('common:decline')}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={styles.container}>
      <Modal isVisible={modalVisible}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </View>
          <View style={styles.body}>{renderItems()}</View>
          <View style={styles.footer}>{renderNegativeItem()}</View>
        </View>
      </Modal>
    </View>
  )
}
