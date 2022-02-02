import { StyleSheet } from 'react-native'

const Colors = {
  graniteGrey: '#5F6368',
  Platinum: '#DEE1E6',
  antiFlashWhite: '#F1F3F4',
  almostWhite: '#F9F9F9',
  grey: '#BABCBE',
  davyGrey: '#535353',
  raisinBlack: '#202124',
  green: '#0F9D58',
  red: '#DB4437',
  yellow: '#F4B400',
  link: '#147EFB',
  blue: 'blue',
}

const listItemContainer = {
  padding: 10,
  marginVertical: 4,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: Colors.grey,
  backgroundColor: Colors.antiFlashWhite,
  borderRadius: 4,
}

export const statusBarBgColor = 'white'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: '2%',
  },
  item: {
    ...listItemContainer,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: Colors.raisinBlack,
    marginBottom: 4,
  },
  itemSublabel: {
    fontSize: 12,
    color: Colors.davyGrey,
  },
  leftSide: {},
  footer: {
    padding: 14,
  },
  scanStatusHeaderText: {
    paddingVertical: 8,
    backgroundColor: Colors.almostWhite,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
})
