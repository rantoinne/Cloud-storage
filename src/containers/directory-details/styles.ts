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
    marginBottom: 12,
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
  scrollViewStyle: { paddingHorizontal: '5%' },
  safeAreaView: { flex: 1 },
  topSpacing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPaddingGridView: {
    paddingHorizontal: '0%',
    marginBottom: 12,
  },
})
