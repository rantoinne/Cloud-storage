import React, { FunctionComponent } from 'react'
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import Modal from 'react-native-modal'
import { translate } from '@i18n'
import styles from './styles'
import { Button, SvgIcon } from '@components'
import { logoBlueLarge, settingsIos, settingsAndroid } from '@images'

type Props = {
  onClose: () => void
  modalVisible?: boolean
  onPressPositiveButton?: () => void
  title?: string
  description?: string
  positiveBtnTitle?: string
  negativeBtnTitle?: string
}

export const PermissionRequestModal: FunctionComponent<Props> = ({
  modalVisible,
  onPressPositiveButton,
  onClose,
  title,
  description,
  positiveBtnTitle,
  negativeBtnTitle,
}) => {
  return (
    <View style={styles.container}>
      <Modal isVisible={modalVisible}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Image style={styles.headerImage} source={Platform.OS === 'android' ? settingsAndroid : settingsIos} />
            <SvgIcon name='arrow-right-lg' size={24} />
            <Image style={styles.headerImage} source={logoBlueLarge} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{title ?? translate('accessPhotoLibrary:title')}</Text>
            <Text style={styles.description}>{description ?? translate('accessPhotoLibrary:description')}</Text>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.negativeBtnContainer} onPress={onClose}>
              <Text style={styles.negativeBtnTitle}>{negativeBtnTitle ?? translate('common:cancel')}</Text>
            </TouchableOpacity>
            <Button
              containerStyle={styles.positiveBtnContainer}
              nameStyle={styles.positiveBtnTitle}
              name={positiveBtnTitle ?? translate('common:openSettings')}
              onPress={() => {
                onClose()
                if (onPressPositiveButton) onPressPositiveButton()
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}
