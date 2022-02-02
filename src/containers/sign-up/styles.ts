import { StyleSheet, TextStyle } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
  header: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    color: color.palette.black,
    marginTop: 16,
    alignSelf: 'center',
  } as TextStyle,
  subheader: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.textDark3,
    marginTop: 30,
    alignSelf: 'center',
  } as TextStyle,
  subheaderBold: {
    fontFamily: family.PoppinsBold,
  } as TextStyle,
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.doveGray,
    marginTop: 20,
    alignSelf: 'center',
    textAlign: 'center',
  },
  checkBox: {
    paddingLeft: 0,
  },
  link: {
    color: color.palette.linkDeep,
    fontFamily: family.PoppinsMedium,
    fontSize: 10,
    marginHorizontal: 3,
  },
  checkBoxText: {
    color: color.palette.dark2,
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
  },
  copiedText: {
    position: 'absolute',
    bottom: 50,
    color: color.palette.green,
    alignSelf: 'center',
    fontSize: 16,
    fontFamily: family.PoppinsMedium,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  checkBoxDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
