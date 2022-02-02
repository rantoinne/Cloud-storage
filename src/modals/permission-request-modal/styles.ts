import { StyleSheet, Dimensions } from 'react-native'
import { color, spacing, family } from '@theme'

const windowWidth = Dimensions.get('window').width

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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
    backgroundColor: color.palette.lavenderMist,
  },
  headerImage: {
    width: (67 / 375) * windowWidth,
    height: (67 / 375) * windowWidth,
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 16,
    color: color.palette.dark2,
    lineHeight: 26,
  },
  description: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.dark2,
    marginTop: spacing[3],
    lineHeight: 23,
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[5],
  },
  negativeBtnContainer: {
    flex: 4,
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
    flex: 6,
    marginLeft: spacing[2],
  },
  positiveBtnTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 13,
    color: color.palette.white,
  },
})
