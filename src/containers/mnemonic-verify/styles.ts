import { StyleSheet, TextStyle } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    paddingHorizontal: '5%',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  phrasesContainer: {
    marginTop: 12,
  },
  header: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    color: color.palette.black,
    marginTop: 16,
    alignSelf: 'center',
  } as TextStyle,
  subheader: {
    fontFamily: family.PoppinsRegular,
    fontSize: 14,
    color: color.textDark3,
    marginTop: 10,
    alignSelf: 'center',
  } as TextStyle,
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.doveGray,
    marginTop: 10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  skip_text: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 12,
    color: color.textDark2,
    marginTop: 24,
    alignSelf: 'center',
    textDecorationLine: 'underline',
  },
  error_text: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.error,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    right: 32,
  },
})
