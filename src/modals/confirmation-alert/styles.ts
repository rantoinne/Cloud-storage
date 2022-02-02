import { StyleSheet, Platform } from 'react-native'
import { color, spacing, family } from '@theme'

export default StyleSheet.create({
  container: {},
  modal: {},
  contentContainer: {
    backgroundColor: color.background,
    borderRadius: 12,
    marginHorizontal: spacing[3],
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
    borderBottomWidth: 0.3,
    borderBottomColor: Platform.OS === 'android' ? color.palette.black : color.palette.quickSilver,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing[3],
  },
  headerText: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 14,
    color: color.palette.dark2,
  },
  body: {},
  itemContainer: {
    borderBottomWidth: 0.3,
    borderBottomColor: Platform.OS === 'android' ? color.palette.black : color.palette.quickSilver,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing[3],
  },
  itemText: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[4],
    fontFamily: family.PoppinsRegular,
    fontSize: 13,
    color: color.palette.dark2,
  },
  footer: {},
  negativeText: {
    marginHorizontal: spacing[4],
    marginVertical: 20,
    fontFamily: family.PoppinsRegular,
    fontSize: 13,
    color: color.palette.bitterSweet,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
