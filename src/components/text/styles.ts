import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  b: {
    fontFamily: family.PoppinsSemiBold,
  },
  u: {
    textDecorationLine: 'underline',
    color: color.link,
  },
  actionText: {
    color: color.link,
    fontFamily: family.PoppinsMedium,
    fontSize: 8,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
    paddingVertical: 8,
  },
})
