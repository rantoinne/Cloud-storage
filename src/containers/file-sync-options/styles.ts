import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  body: {
    flex: 0.9,
    justifyContent: 'center',
  },
  skipButtonContainer: {
    marginHorizontal: '5%',
    marginBottom: 20,
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: 'center',
  },
  logoText: {
    marginTop: 10,
    fontFamily: family.PoppinsBold,
    fontSize: 28,
    color: color.palette.blue,
    alignSelf: 'center',
  },
  question: {
    marginTop: 10,
    fontFamily: family.PoppinsMedium,
    fontSize: 20,
    color: color.palette.black,
    textAlign: 'center',
  },
  skipButton: {
    marginHorizontal: '5%',
    marginBottom: 40,
  },
})
