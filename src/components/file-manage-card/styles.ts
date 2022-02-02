import { color, family } from '@theme'
import { StyleSheet } from 'react-native'

const paddingHorizontal = 14

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    borderRadius: 8,
    backgroundColor: color.palette.lightCyan4,
    marginTop: 15,
  },
  leftSideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: paddingHorizontal,
  },
  rightSideContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  fileInfo: {
    marginLeft: 8,
  },
  nameText: {
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
    color: color.textDark2,
  },
  sizeText: {
    fontFamily: family.PoppinsRegular,
    fontSize: 8,
    color: color.palette.quickSilver,
    marginTop: 6,
  },
  closeIcon: {
    padding: 12,
    alignSelf: 'flex-start',
    borderTopRightRadius: 8,
  },
  indicatorContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  indicatorText: {
    marginTop: 4,
    fontFamily: family.PoppinsRegular,
    fontSize: 8,
    color: color.palette.quickSilver,
  },
  paddingRight: {
    paddingRight: paddingHorizontal,
  },
  progressCircleContainer: {
    width: 22,
    height: 22,
  },
  underline: {
    textDecorationLine: 'underline',
  },
})
