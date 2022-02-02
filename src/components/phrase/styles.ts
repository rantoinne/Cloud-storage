import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: color.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: color.palette.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  text: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 14,
    color: color.textDark4,
  },
})
