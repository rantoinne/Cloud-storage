import { StyleSheet } from 'react-native'
import { color } from '@theme'

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  moveHereText: {
    color: color.primary,
    textDecorationLine: 'underline',
  },
  disabledMoveHereTextContainer: {
    opacity: 0.5,
  },
  flex: {
    flex: 1,
  },
  headerComponent: {
    marginTop: 20,
  },
})
