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
    marginTop: 24,
    alignSelf: 'center',
  } as TextStyle,
  subheader: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.doveGray,
    marginTop: 30,
    alignSelf: 'center',
  } as TextStyle,
  link: {
    fontFamily: family.PoppinsMedium,
    fontSize: 10,
    alignSelf: 'center',
    marginTop: 16,
  } as TextStyle,
  noAccountText: {
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
    color: color.textDark2,
    marginTop: 10,
    alignSelf: 'center',
  } as TextStyle,
  line: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
    width: 75,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  orText: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 16,
    color: color.palette.shark,
    marginHorizontal: 20,
  },
})
