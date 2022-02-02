import React, { useEffect, useMemo } from 'react'
import { TouchableOpacity, View, Text, ViewStyle } from 'react-native'
import { FileModelType } from '@models/stores/models'
import { observer } from 'mobx-react-lite'
import { truncateString, formatByte, getDateText } from '@utils'
import { getThumbnail } from '@config'
import { listStyles, iconStyles } from './styles'
import { translate } from '@i18n'
import { SvgIcon } from '@components/svg-icon'
import { MetaController } from '@controllers'
import { ProgressiveImage } from '@components'
import { useStores } from '@models'
import { useRoute } from '@react-navigation/core'
export { fileHorizontalSeparator, fileMinWidth } from './styles'

const textLimitList = listLayout => (listLayout ? 40 : 18)

declare type Props = {
  file: FileModelType
  listLayout?: boolean
  wrapperStyle?: ViewStyle
  multiSelectActive?: boolean
  isMovingFiles?: boolean
  onPress?: (file: FileModelType) => void
  onFileSelected?: (file: FileModelType, isSelected?: boolean) => void
  onPressOptions?: (file: FileModelType) => void
  onLongPressFileHandler?: (file: FileModelType) => void
  refreshing?: boolean
}

export const File = observer((props: Props) => {
  const { params } = useRoute<RouteParams>()
  const {
    refreshing,
    file,
    listLayout,
    wrapperStyle,
    multiSelectActive = false,
    onPress,
    onFileSelected,
    onPressOptions,
    isMovingFiles,
    onLongPressFileHandler,
  } = props
  const {
    fileListStore: { fetchFileMetaData, fetchFolderMetaData, getPublicShareLink },
  } = useStores()
  const { isSelected, name, starred, isDir, type, size, filesCount, uploaded, isSharedPublic, isSharedPrivate } = file
  const disabled = !isDir ? params?.isMovingFiles || isMovingFiles : false

  useEffect(() => {
    if (refreshing || !uploaded) {
      if (isDir) {
        fetchFolderMetaData(params?.path || '/', file)
      } else {
        fetchFileMetaData(file.path, file)
      }
    }
  }, [isDir, uploaded, refreshing])

  const styles = listLayout ? listStyles : iconStyles
  const shareNamePrefix = isSharedPublic ? 'public' : 'private'
  const dotsIconName = listLayout ? 'dots-flat' : 'dots'
  const wordCreated = listLayout ? 'Created' : ''
  const isShared = isSharedPrivate || isSharedPublic
  const uploadedText = useMemo(() => `${wordCreated} ${getDateText(uploaded)}`, [uploaded])
  const sizeText = useMemo(() => `${formatByte(size)}`, [size])
  const metaInfo = useMemo(() => {
    return isDir
      ? `${filesCount} ${translate(filesCount > 1 ? 'common:file_plural' : 'home:file', {
          count: filesCount,
        })}, ${uploadedText}`
      : `${sizeText}, ${uploadedText}`
  }, [uploadedText, filesCount, sizeText])
  const filename = useMemo(() => truncateString(name, textLimitList(listLayout)), [name, listLayout, wrapperStyle.flex])

  const getThumbnailForPublicSharedImage = async () => {
    const publicSharingUrl = await getPublicShareLink(file.location)
    const publicShareThumbnail = await MetaController.metadataAccess.getPublicShareUrl(publicSharingUrl)
    return publicShareThumbnail
  }

  const renderDots = (
    <SvgIcon containerStyle={styles.dots} name={dotsIconName} size={16} onPress={() => onPressOptions(file)} />
  )

  const svgThumbnail = <SvgIcon name={getThumbnail(isDir, type)} size={listLayout ? 25 : 75} />

  const renderThumbnail = useMemo(
    () =>
      type && type.includes('image') && !listLayout && isSharedPublic ? (
        <ProgressiveImage
          thumbnailIcon={svgThumbnail}
          style={iconStyles.thumbnailImageStyle}
          fetchSource={getThumbnailForPublicSharedImage}
        />
      ) : (
        svgThumbnail
      ),
    [isSharedPublic, listLayout, type],
  )

  const renderStar = useMemo(
    () => (starred ? <SvgIcon containerStyle={styles.starIcon} name='starred-file' size={10} /> : null),
    [starred],
  )
  const renderShared = useMemo(
    () => <SvgIcon containerStyle={styles.shareIcon} name={`${shareNamePrefix}-share-view`} size={12} />,
    [shareNamePrefix],
  )

  const renderSelectIcon = useMemo(
    () => (
      <SvgIcon
        containerStyle={styles.selectIcon}
        name={`circle-select-${isSelected ? 'active' : 'inactive'}`}
        size={16}
      />
    ),
    [isSelected],
  )

  const handlePress = () => {
    if (disabled) return
    if (multiSelectActive) {
      if (!isDir) {
        onFileSelected?.(file, !isSelected)
      }
    } else onPress(file)
  }

  const _onLongPressFileHandler = () => onLongPressFileHandler(file)

  const fileTouchableHandlerProps = {
    activeOpacity: disabled ? 1 : 0.7,
    onPress: handlePress,
    style: [styles.container, disabled && styles.disabledContainer],
    disabled,
    onLongPress: _onLongPressFileHandler,
  }

  if (listLayout) {
    return (
      <TouchableOpacity {...fileTouchableHandlerProps}>
        {renderThumbnail}
        <View style={styles.leftSideContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {filename}
          </Text>
          <View style={styles.subtitleContainer}>
            {renderStar}
            <Text style={iconStyles.subtitle}>{metaInfo}</Text>
          </View>
        </View>
        {isShared && renderShared}
        {multiSelectActive && !isDir && renderSelectIcon}
        {!multiSelectActive && !isMovingFiles && renderDots}
      </TouchableOpacity>
    )
  } else {
    return (
      <View style={[wrapperStyle, disabled && styles.disabledContainer]}>
        <TouchableOpacity {...fileTouchableHandlerProps}>
          {renderThumbnail}
          {multiSelectActive && !isDir && renderSelectIcon}
        </TouchableOpacity>
        <Text numberOfLines={2} style={styles.title}>
          {filename}
        </Text>
        <View style={styles.bottomSideContainer}>
          <View style={styles.subtitleContainer}>
            {renderStar}
            <Text style={iconStyles.subtitle}>{metaInfo}</Text>
            {isShared && renderShared}
            {!multiSelectActive && !isMovingFiles && renderDots}
          </View>
        </View>
      </View>
    )
  }
})
