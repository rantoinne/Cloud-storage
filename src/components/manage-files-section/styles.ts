import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  topContainer: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: color.palette.gray5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 15,
    marginBottom: 15,
  },
  title: {
    fontFamily: family.PoppinsMedium,
    fontSize: 14,
    color: color.textBlack,
    paddingVertical: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevronIconContainer: {
    paddingRight: 8,
  },
  emptyViewText: {
    fontSize: 8,
    color: color.palette.quickSilver,
  },
})
