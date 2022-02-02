import { StyleSheet } from 'react-native'
import { color, family } from '@theme'

export default StyleSheet.create({
  container: {
    backgroundColor: color.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: 40,
    shadowColor: color.shadowColor,
    shadowOpacity: 0.05,
    elevation: 5,
  },
  headerContainer: {},
  floatingContainer: {
    // marginBottom: 30,
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerFloatingContainer: {
    width: '85%',
    borderRadius: 12,
    backgroundColor: color.background,
    padding: 20,
    paddingBottom: 25,
    marginTop: 20,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8.0,
    elevation: 4,
  },
  skipButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginRight: 20,
  },
  logoContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  sliderItemContainer: {
    alignItems: 'center',
  },
  carouselImage: {
    marginTop: 12,
    height: '30%',
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontFamily: family.PoppinsMedium,
    fontSize: 10,
    color: color.palette.grayMid,
  },
  pageIndicatorIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  pageIndicatorIcon: {
    width: 27,
    height: 4,
    borderRadius: 3.5,
    backgroundColor: color.palette.lightCyan1,
    marginHorizontal: 4,
  },
  activePageIndicatorIcon: {
    width: 27,
    height: 4,
    borderRadius: 3.5,
    backgroundColor: color.palette.blue,
    marginHorizontal: 4,
  },
  title: {
    fontFamily: family.PoppinsSemiBold,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  description: {
    fontFamily: family.PoppinsRegular,
    fontSize: 12,
    textAlign: 'center',
    color: color.palette.suvaGrey,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  carouselContent: {
    marginTop: '3%',
  },
  carouselStyle: {
    justifyContent: 'center',
  },
  carouselContainer: {
    flexGrow: 0,
    maxHeight: '30%',
  },
})
