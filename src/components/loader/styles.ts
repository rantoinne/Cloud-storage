import { StyleSheet } from 'react-native'
import { color } from '@theme'

export default StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.overlay,
    zIndex: 2,
  },
  loader: {
    height: 160,
  },
})
