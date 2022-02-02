import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: '5%',
  },
  title: {
    color: color.primary,
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    color: color.palette.gray2,
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    marginTop: 10,
    lineHeight: 20,
  },
  textBold: {
    fontFamily: family.PoppinsSemiBold,
  },
  errorText: {
    color: color.error,
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
})
