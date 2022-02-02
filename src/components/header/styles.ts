import { StyleSheet, Platform, NativeModules, ViewStyle } from 'react-native'
import { color, family } from '@theme'
const { StatusBarManager } = NativeModules

const loaderHeight = 6
const _statusBarHeight = StatusBarManager.HEIGHT
const statusBarHeight = Platform.OS === 'ios' ? _statusBarHeight : 10
const paddingStyles =
  Platform.OS === 'ios'
    ? {
        paddingTop: statusBarHeight,
        paddingBottom: loaderHeight,
      }
    : {
        paddingTop: statusBarHeight / 2,
        paddingBottom: loaderHeight + statusBarHeight / 2,
      }

const shadowEffect = {
  shadowColor: color.palette.black,
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 5,
}

export default StyleSheet.create({
  container: {
    overflow: 'visible',
    height: 50 + statusBarHeight,
    ...paddingStyles,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    backgroundColor: color.background,
    zIndex: 3,
    ...shadowEffect,
  } as ViewStyle,
  loaderContainer: {
    position: 'absolute',
    height: loaderHeight,
    backgroundColor: color.transparent,
    marginBottom: 8,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  containerTransparent: {
    zIndex: 0,
    shadowColor: color.background,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  containerLandscape: {
    height: 45,
    paddingTop: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 6,
  },
  rightSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 0.35,
  },
  backIcon: {
    marginRight: 10,
  },
  title: {
    fontFamily: family.PoppinsMedium,
    fontSize: 14,
    color: color.textBlack,
    lineHeight: 17,
    textAlign: 'left',
  },
  icon: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  logoImage: {
    width: 18,
    height: 18,
    paddingRight: 5,
  },
  logoText: {
    fontFamily: family.PoppinsBold,
    fontSize: 18,
    color: color.primary,
    alignSelf: 'center',
    marginLeft: 8,
  },
})
