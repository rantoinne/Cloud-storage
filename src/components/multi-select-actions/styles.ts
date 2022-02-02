import { Platform, StyleSheet } from 'react-native'
import { color, family } from '@theme'

const menuHeight = 62

const shadowEffect = {
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 8.0,
  elevation: 6,
  shadowColor: color.shadowColor,
}

export default StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: menuHeight,
    paddingHorizontal: 12,
    backgroundColor: color.background,
    ...shadowEffect,
  },
  modalStyle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  selectText: {
    color: color.palette.black,
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
  },
  actionIconContainer: {
    padding: 12,
  },
  deleteContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 10 : menuHeight + 10,
    backgroundColor: color.background,
  },
  buttonStyle: {
    marginTop: 12,
    marginBottom: 6,
  },
  buttonConfirmation: {
    fontSize: 12,
    alignSelf: 'center',
  },
  cancelText: {
    fontSize: 12,
    color: color.primary,
    textDecorationLine: 'underline',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  opacity20: {
    opacity: 0.8,
  },
})
