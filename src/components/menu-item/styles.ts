import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.borderBottomGrey,
    height: 70,
    paddingHorizontal: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderBottomGrey,
    height: 70,
  },
  leftImage: {
    marginRight: 20,
  },
  title: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
  },
  font14: {
    fontSize: 14,
  },
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.quickSilver,
    marginTop: 4,
  },
  rightChevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightChevronLabel: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.quickSilver,
    paddingRight: 6,
  },
  turnedOnText: {
    color: color.palette.blue,
  },
})
