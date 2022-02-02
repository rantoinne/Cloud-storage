import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export const marginTop = 16

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop,
  },
  headerTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 14,
    color: color.textBlack,
  },
  manageFilesText: {
    fontSize: 10,
  },
})
