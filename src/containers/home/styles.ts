import { color } from '@theme'
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  buttonCircleContainer: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    alignSelf: 'flex-end',
  },
  syncOpsContainer: {
    paddingHorizontal: '5%',
  },
  renderHeaderContainer: {
    width: '100%',
    zIndex: 10,
    elevation: 100,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowColor: `${color.palette.black}20`,
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  flex: {
    flex: 1,
  },
  topSpacing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTopSpacing: {
    marginBottom: 4,
  },
})
