import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { color, family } from '@theme'

const toastStyle = {
  alignItems: 'center',
  borderRadius: 8,
  flexDirection: 'row',
  justifyContent: 'space-between',
  // height: 50,
  paddingHorizontal: 10,
  borderWidth: 1,
}

const textStyle = {
  fontFamily: family.PoppinsMedium,
  color: color.textDark1,
  fontSize: 11,
  width: '90%',
  paddingVertical: 10,
  paddingLeft: 10,
}

export default StyleSheet.create({
  containerStyle: {
    width: '85%',
  },
  leftContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeIcon: {
    padding: 10,
    right: 15,
  },
  infoText: {
    ...textStyle,
    color: color.palette.dark1,
  } as TextStyle,
  successText: {
    ...textStyle,
    color: color.palette.dark1,
  } as TextStyle,
  errorText: {
    ...textStyle,
    color: color.palette.dark1,
  } as TextStyle,
  infoToast: {
    ...toastStyle,
    backgroundColor: color.toastInfoBg,
    borderColor: color.toastInfoBorder,
  } as ViewStyle,
  successToast: {
    ...toastStyle,
    backgroundColor: color.toastSuccessBg,
    borderColor: color.toastSuccessBorder,
  } as ViewStyle,
  errorToast: {
    ...toastStyle,
    backgroundColor: color.toastErrorBg,
    borderColor: color.toastErrorBorder,
  } as ViewStyle,
})
