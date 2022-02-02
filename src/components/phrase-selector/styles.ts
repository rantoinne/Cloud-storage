import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {},
  title: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.emperor,
    paddingLeft: 10,
  },
  phrasesRow: {
    backgroundColor: color.palette.white,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 40,
    shadowColor: color.palette.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 13,
    borderColor: color.palette.white,
    borderWidth: 1,
    borderBottomStartRadius: 20,
    borderTopStartRadius: 20,
    borderBottomEndRadius: 20,
    borderTopEndRadius: 20,
  },
  phraseCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: color.palette.grayLight,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  phraseCellFirst: {
    borderBottomStartRadius: 20,
    borderTopStartRadius: 20,
  },
  phraseCellLast: {
    borderBottomEndRadius: 20,
    borderTopEndRadius: 20,
    borderRightColor: color.palette.white,
  },
  phraseCellActive: {
    backgroundColor: color.palette.lightCyan1,
    borderRightColor: color.palette.white,
  },
  noBorderRight: {
    borderRightColor: color.palette.white,
  },
  phraseText: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.black,
  },
  phraseTextActive: {
    color: color.palette.linkDeep,
  },
})
