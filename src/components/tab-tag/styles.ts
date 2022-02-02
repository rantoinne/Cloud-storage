import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: family.PoppinsMedium,
    color: color.palette.black,
    fontSize: 12,
  },
  containerActive: {
    backgroundColor: color.palette.blue20,
  },
  labelActive: {
    color: color.palette.blue,
  },
})
