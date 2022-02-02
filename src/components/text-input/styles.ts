import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

const errorFontSize = 10
const errorMarginTop = 6
export const inputHeight = 42
export const inputHeightWithError = inputHeight + errorFontSize + errorMarginTop

export default StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  textInput: {
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
    backgroundColor: color.palette.lightCyan1,
    borderRadius: inputHeight / 2,
    height: inputHeight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: color.palette.dark3,
    width: '100%',
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
    color: color.palette.lightGray,
  },
  textError: {
    fontFamily: family.PoppinsRegular,
    fontSize: errorFontSize,
    color: color.error,
    marginTop: errorMarginTop,
  },
})
