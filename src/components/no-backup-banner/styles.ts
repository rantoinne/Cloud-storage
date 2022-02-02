import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {},
  noBackUpTitle: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 16,
    color: color.palette.white,
  },
  noBackUpSubtitle: {
    marginTop: 4,
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.white,
  },
  noBackUpContainer: {
    minHeight: 122,
    backgroundColor: color.palette.royalBlue,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swoosh: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  leftSide: {
    paddingVertical: 16,
    paddingLeft: 16,
    flex: 0.6,
    justifyContent: 'center',
  },
  rightSide: {
    paddingRight: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 0.4,
  },
  linkWhite: {
    marginTop: 16,
    paddingVertical: 6,
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.white,
    textDecorationLine: 'underline',
  },
})
