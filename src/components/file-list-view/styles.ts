import { color, family } from '@theme'
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  columnWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontFamily: family.PoppinsMedium,
    fontSize: 12,
    color: color.textDark2,
    paddingHorizontal: '5%',
    paddingVertical: 10,
    marginBottom: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paddingHorizontal: {
    paddingHorizontal: '5%',
  },
  header: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  iconLeft: {
    paddingVertical: 8,
    paddingRight: 12,
    paddingLeft: 8,
  },
  iconFilterOrder: {
    paddingVertical: 8,
  },
  iconRight: {
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 2,
  },
  listHeaderLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortByText: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    color: color.palette.gray4,
    marginLeft: 4,
  },
  listHeaderRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 12,
    color: color.palette.blue,
    textDecorationLine: 'underline',
    padding: 6,
    alignSelf: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  cancelText: {
    color: color.palette.red,
  },
  marginBottom: {
    marginBottom: 50,
  },
})
