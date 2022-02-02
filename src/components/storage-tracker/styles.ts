import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: color.palette.white,
    shadowColor: color.shadowColor,
    borderRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.0,
    elevation: 2,
  },
  storageTrackerBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  trackerItem: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  trackerItemTitle: {
    fontSize: 12,
    fontFamily: family.PoppinsSemiBold,
    color: color.palette.gray3,
  },
  trackerItemSubTitle: {
    fontSize: 10,
    fontFamily: family.PoppinsLight,
    color: color.palette.gray3,
  },
  dismisText: {
    color: color.primary,
    textDecorationLine: 'underline',
    textDecorationColor: color.primary,
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    marginLeft: 16,
  },
  slider: {
    width: '100%',
    height: 4,
    borderRadius: 3,
  },
  slideBar: {
    height: '100%',
    borderRadius: 6,
  },
})
