import { translate, TxKeyPath } from '@i18n'
import { color } from '@theme'
import { Bar } from 'react-native-progress'
import React, { FunctionComponent } from 'react'
import { View, Text, ViewProps, Image, TextStyle, TouchableOpacity } from 'react-native'
import { autoSync, backingUp, lock, issueUploading, allDone, fileDownload } from '@images'
import styles, {
  needPermStyles,
  backedUpStyles,
  failUploadStyles,
  progressUploadStyles,
  fetchingUpdatesStyles,
  autoSyncStyles,
} from './styles'

const trackerColor = { bgColor: color.lightGreen, tracker: color.green }

/* MICRO COMPONENTS */
export const BadgeNumberTag: FunctionComponent<{ value: number; error?: boolean }> = ({ value, error = false }) => (
  <View style={[styles.numberTag, error && styles.numberTagError]}>
    <Text style={styles.numberTagText}>{value}</Text>
  </View>
)

export const BadgeTextLink: FunctionComponent<{ text: string; onPress: () => void }> = ({ text, onPress }) => (
  <Text style={styles.textLink} onPress={onPress}>
    {text}
  </Text>
)

export const BadgeTextButton: FunctionComponent<{ text: string; onPress: () => void; width?: string }> = ({
  text,
  onPress,
}) => (
  <TouchableOpacity style={styles.textButton} onPress={onPress}>
    <Text style={styles.textButtonTitle}>{text}</Text>
  </TouchableOpacity>
)

export const BadgeSubtitle: FunctionComponent<{ text: string; style?: TextStyle }> = ({ text, style }) => (
  <Text style={[styles.subtitle, style && style]}>{text}</Text>
)

export const BadgeTitle: FunctionComponent<{ bold?: boolean; text: string }> = ({ bold = false, text }) => (
  <Text style={[styles.title, bold && styles.titleBold]}>{text}</Text>
)

type BadgeProps = {
  isVisible?: boolean
  marginTop?: number
}

interface BadgeContainerProps extends ViewProps {
  isVisible?: boolean
  marginTop?: number
}

export const BadgeContainer: FunctionComponent<BadgeContainerProps> = ({
  isVisible,
  marginTop = 0,
  children,
  style,
  ...otherProps
}) => {
  if (!isVisible) return null
  return (
    <View style={[styles.container, style, { marginTop }]} {...otherProps}>
      {children}
    </View>
  )
}

/* BadgeNeedPermission COMPONENT */
interface BadgeNeedPermissionProps extends BadgeProps {
  onPressLink: () => void
}
export const BadgeNeedPermission: FunctionComponent<BadgeNeedPermissionProps> = ({
  onPressLink,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={lock} style={styles.circleIcon} />
    <View style={needPermStyles.rightContainer}>
      <BadgeTitle text={translate('home:need_permissions')} bold />
      <BadgeSubtitle text={translate('home:need_permissions_desc')} style={needPermStyles.subtitle} />
      <BadgeTextButton text={translate('home:view_settings')} onPress={onPressLink} width='40%' />
    </View>
  </BadgeContainer>
)

/* BadgeBackedUp COMPONENT */
interface BadgeBackedUpProps extends BadgeProps {
  onPressClose: () => void
  count?: number
}

const fileUploadedText = (count: number) => {
  const prefixText: TxKeyPath = count > 1 ? 'home:num_of_files_uploaded' : 'home:num_of_file_uploaded'
  return translate(prefixText, { count })
}

export const BadgeBackedUp: FunctionComponent<BadgeBackedUpProps> = ({
  onPressClose,
  count = 0,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={allDone} style={styles.circleIcon} />
    <View style={backedUpStyles.leftContainer}>
      <View style={backedUpStyles.allDoneHeader}>
        <View style={backedUpStyles.badgeTitleContainer}>
          <BadgeTitle text={translate('home:all_backed_up')} bold />
        </View>
        <Text style={backedUpStyles.dismisText} onPress={onPressClose}>
          {translate('dismiss').toLocaleUpperCase()}
        </Text>
      </View>
      <BadgeSubtitle text={fileUploadedText(count)} style={backedUpStyles.subtitle} />
    </View>
  </BadgeContainer>
)

/* BadgeFailUpload COMPONENT */
interface BadgeFailBaseProps extends BadgeProps {
  onPressClose: () => void
  onPressLink: () => void
  count: number
}

const fileFailedUploadingText = (count: number) => {
  const prefixText: TxKeyPath = count > 1 ? 'home:failure_upload_plural' : 'home:failure_upload'
  return translate(prefixText, { count })
}

export const BadgeFailUpload: FunctionComponent<BadgeFailBaseProps> = ({
  onPressClose,
  onPressLink,
  count,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={issueUploading} style={styles.circleIcon} />
    <View style={failUploadStyles.leftContainer}>
      <View style={backedUpStyles.allDoneHeader}>
        <View style={backedUpStyles.badgeTitleContainer}>
          <BadgeTitle text={translate('home:failure_upload_title')} bold />
        </View>
        <Text style={backedUpStyles.dismisText} onPress={onPressClose}>
          {translate('dismiss').toLocaleUpperCase()}
        </Text>
      </View>
      <BadgeSubtitle text={fileFailedUploadingText(count)} style={failUploadStyles.subtitle} />
      <BadgeTextButton text={translate('home:try_again')} onPress={onPressLink} width='38%' />
    </View>
    {/* <BadgeNumberTag value={count} error /> */}
  </BadgeContainer>
)

/* BadgeProgressUpload COMPONENT */
interface BadgeProgressBaseProps extends BadgeProps {
  count: number
}
export const BadgeProgressUpload: FunctionComponent<BadgeProgressBaseProps> = ({ count, marginTop = 0, isVisible }) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={backingUp} style={styles.circleIcon} />
    <View style={progressUploadStyles.leftContainer}>
      <BadgeTitle text={translate('home:backing_up') + '...'} bold />
      <Bar
        style={progressUploadStyles.slider}
        indeterminate={true}
        color={trackerColor.tracker}
        useNativeDriver={true}
        borderColor={'transparent'}
        unfilledColor={trackerColor.bgColor}
        indeterminateAnimationDuration={1500}
        animationType='spring'
      />
      <Text style={progressUploadStyles.fileCount}>
        {count} {count > 1 ? translate('home:files') : translate('home:file')}
      </Text>
    </View>
  </BadgeContainer>
)

/* BadgeFetchingUpdates COMPONENT */
interface BadgeFetchingUpdatesProps extends BadgeProps {}
export const BadgeFetchingUpdates: FunctionComponent<BadgeFetchingUpdatesProps> = ({ marginTop = 0, isVisible }) => (
  <BadgeContainer style={fetchingUpdatesStyles.container} marginTop={marginTop} isVisible={isVisible}>
    <View style={fetchingUpdatesStyles.leftContainer}>
      <BadgeTitle text={translate('home:fetching_files') + '...'} />
      <Bar
        style={fetchingUpdatesStyles.slider}
        indeterminate={true}
        color={trackerColor.tracker}
        useNativeDriver={true}
        borderColor={'transparent'}
        unfilledColor={trackerColor.bgColor}
        indeterminateAnimationDuration={1500}
      />
    </View>
    <View />
  </BadgeContainer>
)

/* BadgeAutoSync COMPONENT */
interface BadgeAutoSyncProps extends BadgeProps {
  isVisible: boolean
  marginTop?: number
}
export const BadgeAutoSync: FunctionComponent<BadgeAutoSyncProps> = ({ marginTop = 0, isVisible }) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={autoSync} style={styles.circleIcon} />
    <View style={autoSyncStyles.leftContainer}>
      <BadgeTitle text={translate('home:syncing_files_title')} bold />
      <BadgeSubtitle text={translate('home:syncing_files_subtitle')} style={autoSyncStyles.subtitle} />
      <Bar
        style={autoSyncStyles.slider}
        indeterminate={true}
        color={trackerColor.tracker}
        useNativeDriver={true}
        borderColor={'transparent'}
        unfilledColor={trackerColor.bgColor}
        indeterminateAnimationDuration={1500}
        animationType='spring'
      />
    </View>
  </BadgeContainer>
)

const fileDownloadedText = (count: number) => {
  const prefixText: TxKeyPath = count > 1 ? 'home:num_of_files_downloaded' : 'home:num_of_file_downloaded'
  return translate(prefixText, { count })
}

export const BadgeDownloadSuccessful: FunctionComponent<BadgeBackedUpProps> = ({
  onPressClose,
  count = 0,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={allDone} style={styles.circleIcon} />
    <View style={backedUpStyles.leftContainer}>
      <View style={backedUpStyles.allDoneHeader}>
        <View style={backedUpStyles.badgeTitleContainer}>
          <BadgeTitle text={translate('home:all_backed_up')} bold />
        </View>
        <Text style={backedUpStyles.dismisText} onPress={onPressClose}>
          {translate('dismiss').toLocaleUpperCase()}
        </Text>
      </View>
      <BadgeSubtitle text={fileDownloadedText(count)} style={backedUpStyles.subtitle} />
    </View>
  </BadgeContainer>
)

const fileDownloadingText = (count: number) => {
  const prefixText: TxKeyPath = count > 1 ? 'home:downloading_files' : 'home:downloading_file'
  return translate(prefixText, { count })
}

export const BadgeProgressDownload: FunctionComponent<BadgeProgressBaseProps> = ({
  count,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={fileDownload} style={styles.circleIcon} />
    <View style={progressUploadStyles.leftContainer}>
      <BadgeTitle text={fileDownloadingText(count) + '...'} bold />
      <Bar
        style={progressUploadStyles.slider}
        indeterminate={true}
        color={trackerColor.tracker}
        useNativeDriver={true}
        borderColor={'transparent'}
        unfilledColor={trackerColor.bgColor}
        indeterminateAnimationDuration={1500}
        animationType='spring'
      />
      <Text style={progressUploadStyles.fileCount}>
        {count} {count > 1 ? translate('home:files') : translate('home:file')}
      </Text>
    </View>
  </BadgeContainer>
)

const failedDownloadingText = (count: number) => {
  const prefixText: TxKeyPath = count > 1 ? 'home:failure_downloading_your_file' : 'home:failure_downloading_your_files'
  return translate(prefixText, { count })
}

export const BadgeFailDownload: FunctionComponent<BadgeFailBaseProps> = ({
  onPressClose,
  onPressLink,
  count,
  marginTop = 0,
  isVisible,
}) => (
  <BadgeContainer marginTop={marginTop} isVisible={isVisible}>
    <Image source={issueUploading} style={styles.circleIcon} />
    <View style={failUploadStyles.leftContainer}>
      <View style={backedUpStyles.allDoneHeader}>
        <View style={backedUpStyles.badgeTitleContainer}>
          <BadgeTitle text={translate('home:download_failed')} bold />
        </View>
        <Text style={backedUpStyles.dismisText} onPress={onPressClose}>
          {translate('dismiss').toLocaleUpperCase()}
        </Text>
      </View>
      <BadgeSubtitle text={failedDownloadingText(count)} style={failUploadStyles.subtitle} />
      <BadgeTextButton text={translate('home:try_again')} onPress={onPressLink} width='38%' />
    </View>
  </BadgeContainer>
)
