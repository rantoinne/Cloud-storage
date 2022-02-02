import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  noFilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginTop: 10,
  },
  image: {
    resizeMode: 'contain',
  },
  noFilesText: {
    textAlign: 'center',
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.textDark2,
    paddingTop: 20,
  },
  button: {
    marginTop: 32,
    width: 180,
  },
})
