import React from 'react'
import { View, Text } from 'react-native'
import ToastBase from 'react-native-toast-message'
import { color } from '@theme'
import { SvgIcon } from '@components/svg-icon'
import styles from './styles'

const CustomToast = ({ condition, message }) => {
  const toastStyle = styles[condition + 'Toast']
  const textStyle = styles[condition + 'Text']

  return (
    <View style={styles.containerStyle}>
      <View style={toastStyle}>
        <View style={styles.leftContainer}>
          <SvgIcon name={`circle-${condition}`} size={18} />
          <Text style={textStyle}>{message}</Text>
        </View>
        <SvgIcon
          name={'close'}
          size={14}
          containerStyle={styles.closeIcon}
          fill={color.palette.gray}
          onPress={() => ToastBase.hide()}
        />
      </View>
    </View>
  )
}

export const toastConfig = {
  info: ({ text2 }) => <CustomToast condition={'info'} message={text2} />,
  success: ({ text2 }) => <CustomToast condition={'success'} message={text2} />,
  error: ({ text2 }) => <CustomToast condition={'error'} message={text2} />,
}

export const showToast = (type, message) =>
  ToastBase.show({
    type,
    position: 'bottom',
    text2: message,
    visibilityTime: 2000,
    autoHide: true,
    bottomOffset: 75,
  })
