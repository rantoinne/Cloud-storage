import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  modalStyle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  contentWrapper: {
    paddingBottom: 16,
  },
  modalRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalRowContentText: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.textBlack,
    paddingLeft: 16,
    paddingTop: 2,
    lineHeight: 14,
  },
  leftSideItemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomColor: color.borderBottomGrey,
  },
  leftedHeader: {
    justifyContent: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  centeredHeader: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  createFolderText: {
    marginLeft: 7,
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.textBlack,
  },
  flexRowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  emptyBox: {
    width: 14,
  },
})
