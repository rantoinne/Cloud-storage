import { StyleSheet, TextStyle } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
    paddingHorizontal: '5%',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'center',
    marginTop: 30,
  },
  header: {
    fontFamily: family.PoppinsBold,
    fontSize: 20,
    color: color.palette.black,
    marginTop: 30,
    alignSelf: 'center',
  } as TextStyle,
  subheader: {
    fontFamily: family.PoppinsRegular,
    fontSize: 14,
    color: color.palette.grayMid,
    marginTop: 15,
    alignSelf: 'center',
  } as TextStyle,
})
