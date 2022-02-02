import { StyleSheet } from 'react-native'
import { color, family } from '@theme'
const SLIDER_WIDTH = '92%'

export default StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    backgroundColor: color.palette.white,
    shadowColor: color.shadowColor,
    borderRadius: 16,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8.0,
    elevation: 2,
  },
  numberTag: {
    height: 15,
    width: 15,
    borderRadius: 4,
    backgroundColor: color.primary,
    alignSelf: 'center',
    marginRight: 4,
  },
  numberTagError: {
    backgroundColor: color.error,
    justifyContent: 'center',
  },
  numberTagText: {
    fontFamily: family.PoppinsMedium,
    fontSize: 9,
    color: color.palette.white,
    alignSelf: 'center',
    lineHeight: 14,
  },
  textButton: {
    backgroundColor: color.palette.aliceBlue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  textButtonTitle: {
    color: color.palette.blue,
    fontFamily: family.PoppinsMedium,
    padding: 4,
    fontSize: 10,
  },
  textLink: {
    color: color.link,
    fontFamily: family.PoppinsMedium,
    fontSize: 8,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 11,
    color: color.palette.gray3,
  },
  title: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.gray3,
  },
  titleBold: {
    fontFamily: family.PoppinsSemiBold,
  },
  circleIcon: {
    marginRight: 16,
    marginLeft: 8,
    marginTop: 4,
  },
})

export const needPermStyles = StyleSheet.create({
  rightContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
})

export const backedUpStyles = StyleSheet.create({
  leftContainer: {
    flex: 0.96,
    justifyContent: 'space-between',
  },
  allDoneHeader: {
    flexDirection: 'row',
  },
  subtitle: {
    marginTop: 4,
  },
  dismisText: {
    color: color.palette.red,
    textDecorationLine: 'underline',
    textDecorationColor: color.palette.red,
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    marginLeft: 16,
  },
  badgeTitleContainer: {
    flex: 1,
  },
})

export const failUploadStyles = StyleSheet.create({
  leftContainer: {
    flex: 0.98,
    justifyContent: 'space-between',
  },
  numberBadge: {
    alignSelf: 'center',
  },
  subtitle: {
    marginTop: 4,
  },
})

export const progressUploadStyles = StyleSheet.create({
  leftContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: 4,
    marginVertical: 8,
  },
  slideBar: {
    height: '100%',
  },
  fileCount: {
    fontFamily: family.PoppinsRegular,
    fontSize: 11,
    color: color.palette.gray3,
  },
})

export const fetchingUpdatesStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: 4,
  },
  slideBar: {
    height: '100%',
  },
})

export const autoSyncStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  subtitle: {
    marginTop: 8,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: 4,
    marginTop: 14,
    marginBottom: 6,
  },
})
