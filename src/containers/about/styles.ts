import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  storageTrackerContainer: {
    marginHorizontal: 20,
  },
  verticalBuffer: {
    height: 10,
  },
  subtitle: {
    fontFamily: family.PoppinsRegular,
    fontSize: 10,
    color: color.palette.quickSilver,
    paddingRight: 4,
  },
  handleContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  handleText: {
    marginTop: 3,
    marginRight: 12,
  },
  copyIcon: {
    padding: 4,
  },
})
