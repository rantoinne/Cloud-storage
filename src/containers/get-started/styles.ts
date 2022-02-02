import { StyleSheet } from 'react-native'
import { color, family, spacing } from '@theme'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    flex: 1,
    width: '100%',
  },
  topContainer: {
    height: '25%',
    justifyContent: 'center',
  },
  imageCover: {
    height: '100%',
  },
  bottomContainer: {
    height: '75%',
  },
  internalImageContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column-reverse',
    justifyContent: 'flex-start',
  },
  button: {
    marginHorizontal: spacing[6],
  },
  safeAreaView: {
    marginBottom: 32,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing[8],
    paddingHorizontal: spacing[6],
  },
  description: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.white,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    color: color.palette.white,
    alignItems: 'center',
  },
})
