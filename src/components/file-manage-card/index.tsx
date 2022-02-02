import React, { FunctionComponent, useMemo } from 'react'
import { View, Text } from 'react-native'
import { FileModelType } from '@models/stores/models'
import styles from './styles'
import { SvgIcon } from '@components'
import { getThumbnail } from '@config'
import { formatByte, truncateString } from '@utils'
import { translate } from '@i18n'
import { progressCircle } from '@animations'
import AnimatedLottieView from 'lottie-react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { FileDownloader } from '@controllers'

declare type Props = {
  file: FileModelType
  progress?: number
  onPressClose: (file: FileModelType) => void
  onRetry?: (file: FileModelType) => void
  isDownload?: boolean
}

export const FileManageCard: FunctionComponent<Props> = ({
  file,
  progress,
  onPressClose,
  onRetry,
  isDownload = false,
}) => {
  const { name, type, size, status } = file
  const sizeText = useMemo(() => `${formatByte(size)}`, [size])
  const filename = useMemo(() => truncateString(name, 20), [name])
  const renderThumbnail = <SvgIcon name={getThumbnail(false, type)} size={36} />
  const hideCloseIcon = status === 'success' || status === 'in-progress'

  const openShareModal = async () => {
    await FileDownloader.saveOrShareFileAfterDownload(file)
  }

  const closeIcon = () => {
    if (hideCloseIcon) return null
    return (
      <SvgIcon name={'close-bold'} size={12} containerStyle={styles.closeIcon} onPress={() => onPressClose(file)} />
    )
  }

  const renderUploadingIndicator = (progress = 0, isDownload) => (
    <View style={styles.indicatorContainer}>
      <View style={styles.progressCircleContainer}>
        <AnimatedLottieView progress={progress / 100} source={progressCircle} autoPlay={false} loop={false} />
      </View>
      <Text style={styles.indicatorText}>
        {!isDownload ? translate('uploading') : translate('manage_files:downloading') + '...'}
      </Text>
    </View>
  )

  const renderNextUpIndicator = (
    <View style={styles.indicatorContainer}>
      <SvgIcon name={'eclipse'} size={25} />
      <Text style={styles.indicatorText}>{translate('waiting') + '...'}</Text>
    </View>
  )

  const renderCompletedIndicator = useMemo(
    () => (
      <TouchableOpacity disabled={!isDownload} onPress={openShareModal} style={styles.indicatorContainer}>
        <SvgIcon name={'checkmark-circle-done'} size={22} />
        <Text style={[styles.indicatorText, isDownload && styles.underline]}>
          {translate(isDownload ? 'manage_files:view_file' : 'done')}
        </Text>
      </TouchableOpacity>
    ),
    [isDownload],
  )

  const renderInCompleteFailedIndicator = onRetry => (
    <View style={styles.indicatorContainer}>
      <SvgIcon name={'retry-red'} size={22} onPress={onRetry} />
      <Text style={styles.indicatorText}>{translate('failed')}</Text>
    </View>
  )

  const renderInCompleteCanceledIndicator = onRetry => (
    <View style={styles.indicatorContainer}>
      <SvgIcon name={'retry-red'} size={22} onPress={onRetry} />
      <Text style={styles.indicatorText}>{translate('canceled')}</Text>
    </View>
  )

  const renderIndicator = (status: string, onRetry?: (file: FileModelType) => void) => {
    switch (status) {
      case 'need-upload':
        return renderNextUpIndicator
      case 'need-download':
        return renderNextUpIndicator
      case 'success':
        return renderCompletedIndicator
      case 'failed':
        return renderInCompleteFailedIndicator(onRetry)
      case 'cancelled':
        return renderInCompleteCanceledIndicator(onRetry)
      default:
        return null
    }
  }

  const renderStatusIndicator = useMemo(() => renderIndicator(status, () => onRetry(file)), [status])
  const renderStatusIndicatorWithProgress = useMemo(() => renderUploadingIndicator(progress, isDownload), [progress])

  return (
    <View style={styles.container}>
      <View style={styles.leftSideContainer}>
        {renderThumbnail}
        <View style={styles.fileInfo}>
          <Text numberOfLines={1} style={styles.nameText}>
            {filename}
          </Text>
          <Text style={styles.sizeText}>{sizeText}</Text>
        </View>
      </View>
      <View style={[styles.rightSideContainer, hideCloseIcon && styles.paddingRight]}>
        {status === 'in-progress' ? renderStatusIndicatorWithProgress : renderStatusIndicator}
        {closeIcon()}
      </View>
    </View>
  )
}
