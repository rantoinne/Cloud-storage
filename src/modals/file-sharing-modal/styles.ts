import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  modal: {
    paddingHorizontal: '5%',
  },
  contentContainer: {
    backgroundColor: color.background,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerImage: {
    width: 75,
    height: 75,
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 16,
    color: color.palette.dark2,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 12,
    color: color.palette.blue,
    marginTop: 12,
  },
  linkContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: color.palette.lightCyan1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  linkTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 14,
  },
  negativeBtnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 8,
    borderColor: color.palette.red,
  },
  negativeBtnTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 13,
    color: color.palette.red,
  },
  positiveBtnContainer: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
  },
  positiveBtnTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 13,
    color: color.palette.white,
  },
  activityIndicator: {
    marginTop: 20,
    marginBottom: 6,
  },
  textError: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.error,
    marginTop: 10,
  },
})
