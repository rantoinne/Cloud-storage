import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  modal: {
    flex: 1,
    marginHorizontal: '7.5%',
  },
  container: {
    justifyContent: 'space-between',
    height: 185,
    padding: 20,
    borderRadius: 9,
    backgroundColor: color.background,
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  midSection: {},
  botttomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: color.palette.blue,
    borderRadius: 4,
    paddingHorizontal: 12,
    color: color.textDark2,
    fontFamily: family.PoppinsMedium,
    fontSize: 14,
  },
  title: {
    color: color.textBlack,
    fontSize: 14,
    fontFamily: family.PoppinsSemiBold,
  },
  button: {
    width: 90,
  },
  textButton: {
    color: color.textBlack,
    fontSize: 13,
    fontFamily: family.PoppinsRegular,
    textAlignVertical: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
})
