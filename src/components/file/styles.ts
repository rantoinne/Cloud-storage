import { StyleSheet, TextStyle } from 'react-native'
import { color, family } from '@theme'

const fileVerticalSeparator = 10
/* used externally */
export const fileHorizontalSeparator = 20
export const fileMinWidth = 120

const title: TextStyle = {
  fontFamily: family.PoppinsMedium,
  fontSize: 12,
  color: color.textDark2,
  paddingBottom: 4,
}

const subtitle: TextStyle = {
  fontSize: 8,
  fontFamily: family.PoppinsRegular,
  color: color.placeholder,
  textAlign: 'left',
}

const starIcon = {
  paddingRight: 6,
}

export const iconStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: 140,
    borderRadius: 6,
    backgroundColor: color.folderBg,
    marginBottom: fileVerticalSeparator,
  },
  leftSideContainer: {},
  title: {
    ...title,
    marginTop: 3,
    textAlign: 'left',
  },
  subtitle,
  subtitleContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  bottomSideContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  starIcon,
  shareIcon: {
    paddingLeft: 8,
    bottom: 0,
    paddingRight: 16,
  },
  fileImage: {
    alignSelf: 'center',
  },
  dots: {
    position: 'absolute',
    paddingHorizontal: 5,
    paddingVertical: 6,
    right: -8,
    bottom: 0,
  },
  selectIcon: {
    borderRadius: 8,
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  thumbnailImageStyle: {
    width: '75%',
    height: '75%',
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: 5,
  },
})

export const listStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: '5%',
  },
  leftSideContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    flex: 1,
  },
  title,
  subtitle,
  subtitleContainer: {
    flexDirection: 'row',
  },
  bottomSideContainer: {},
  starIcon: starIcon,
  shareIcon: {
    paddingRight: 6,
    paddingLeft: 6,
  },
  fileImage: {},
  dots: {
    padding: 8,
  },
  selectIcon: {
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
  },
  disabledContainer: {
    opacity: 0.5,
  },
})
