import { StyleSheet } from 'react-native'
import { color, spacing, family } from '@theme'

export default StyleSheet.create({
  container: {},
  modal: {},
  contentContainer: {
    backgroundColor: color.background,
    borderRadius: 12,
    marginHorizontal: spacing[3],
    overflow: 'hidden',
    paddingTop: spacing[7],
    paddingLeft: spacing[5],
    paddingRight: spacing[5],
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[2],
    justifyContent: 'flex-end',
  },
  negativeBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  negativeBtnTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 13,
    color: color.palette.silver,
  },
  positiveBtnContainer: {
    marginLeft: spacing[4],
  },
  positiveBtnTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 13,
    color: color.palette.white,
    marginHorizontal: spacing[5],
  },
  loaderContainer: {
    marginVertical: spacing[5],
  },
})
