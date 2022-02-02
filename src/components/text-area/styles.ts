import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

const inputHeight = 230

export default StyleSheet.create({
  container: {},
  textInput: {
    backgroundColor: color.background,
    borderColor: color.palette.grayLight,
    fontFamily: family.PoppinsMedium,
    borderRadius: 11,
    borderWidth: 1,
    height: inputHeight,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    color: color.palette.dark3,
    width: '100%',
    textAlign: 'left',
    marginTop: 10,
    fontSize: 12,
  },
  textInputFocused: {
    backgroundColor: color.palette.lightCyan3,
    borderColor: color.palette.lightCyan3,
  },
  placeholderText: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.placeholder,
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 12,
    color: color.textDark3,
  },
})
