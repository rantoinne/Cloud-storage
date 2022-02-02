import { StyleSheet, ViewStyle } from 'react-native'
import { color, family } from '@theme'

const checkmarkBox: ViewStyle = {
  height: 14,
  width: 14,
  borderRadius: 4,
  borderWidth: 1,
  alignSelf: 'center',
  backgroundColor: 'black',
  justifyContent: 'center',
}

export default StyleSheet.create({
  container: {
    height: 30,
    width: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.textDark2,
  },
  checkmarkBoxChecked: {
    ...checkmarkBox,
    borderColor: color.palette.blue,
    backgroundColor: color.palette.blue,
  },
  checkmarkBoxUnchecked: {
    ...checkmarkBox,
    borderColor: color.palette.dark2,
    backgroundColor: color.transparent,
  },
  darkCheckmarkBoxUnchecked: {
    ...checkmarkBox,
    borderColor: color.palette.gray5,
    backgroundColor: color.transparent,
  },
})
