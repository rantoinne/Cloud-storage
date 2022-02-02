import { StyleSheet, TextStyle } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  phrasesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  phrasesColContainer: {
    flex: 0.45,
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  header: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    color: color.palette.dark2,
    marginTop: 20,
    alignSelf: 'center',
  } as TextStyle,
  subheader: {
    fontFamily: family.PoppinsRegular,
    fontSize: 14,
    color: color.textDark3,
    marginTop: 16,
    alignSelf: 'center',
  } as TextStyle,
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.doveGray,
    marginTop: 18,
    alignSelf: 'center',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  bottomContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: color.background,
    bottom: 0,
    paddingBottom: 16,
  },
  paddingHorizontal: {
    paddingHorizontal: '5%',
  },
  doNotShare: {
    marginTop: 10,
  },
})
