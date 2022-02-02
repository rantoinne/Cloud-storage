import { StyleSheet } from 'react-native'
import { color, family, spacing } from '@theme'

export default StyleSheet.create({
  container: {},
  text: {
    marginVertical: spacing[2],
    marginHorizontal: spacing[2],
    fontFamily: family.PoppinsMedium,
    color: color.palette.boulderGray,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
})
