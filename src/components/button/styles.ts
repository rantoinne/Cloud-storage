import { StyleSheet } from 'react-native'
import { color, family, spacing } from '@theme'

export default StyleSheet.create({
  container: {
    height: 40,
    borderWidth: 1,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    borderColor: color.primary,
  },
  containerCircle: {
    height: 50,
    width: 50,
    borderRadius: 25,
    shadowColor: color.shadowColor,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.circleBg,
    shadowRadius: 3,
    elevation: 5,
  },
  text: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 12,
  },
  containerSmall: {
    backgroundColor: color.palette.white,
    height: 34,
    width: 86,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSmall: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 12,
    color: color.primary,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  icon: {
    paddingHorizontal: spacing[2],
  },
})
