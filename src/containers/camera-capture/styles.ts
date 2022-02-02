import { StyleSheet } from 'react-native'
import { color } from '@theme'

export default StyleSheet.create({
  bgBlack: {
    backgroundColor: color.palette.black,
  },
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 70,
    top: 0,
    justifyContent: 'space-between',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  captureButton: {
    height: 70,
    width: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: color.palette.gray6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  captureInnerRedSquare: {
    backgroundColor: color.palette.red,
    height: 45,
    width: 45,
    borderRadius: 22,
  },
  cancelIconContainer: {
    alignSelf: 'flex-start',
    padding: '5%',
  },
})
