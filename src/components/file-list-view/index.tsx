import React, { FunctionComponent, useMemo, useState } from 'react'
import {
  FlatList,
  FlatListProps as FlatListPropsContract,
  View,
  TouchableOpacity,
  ViewStyle,
  Text,
  useWindowDimensions,
} from 'react-native'
import { translate } from '@i18n'
import { FileModelType } from '@models/stores/models'
import { File, fileHorizontalSeparator, fileMinWidth } from '../file'
import { SvgIcon } from '@components/svg-icon'
import { SortByType } from '@models/stores'
import styles from './styles'
import { RefreshControl } from '@components'

const getNumOfCols = (width: number, islistLayout: boolean) => {
  if (islistLayout) return 1
  /* Because of a 5% horizontal padding in container view, 5% x 2 = 10% */
  const availableContainerWidth = width * 0.9
  const countBeforePadding = Math.floor(availableContainerWidth / fileMinWidth)
  /* Subtract one because we won't add padding right to last column */
  const addedPadding = (countBeforePadding - 1) * fileHorizontalSeparator
  /* Remove all the added paddings width from screen width to get available space */
  const actualAvailableWidth = availableContainerWidth - addedPadding
  return Math.floor(actualAvailableWidth / fileMinWidth)
}

interface FlatListProps extends Omit<FlatListPropsContract<FileModelType>, 'renderItem'> {}

interface Props extends FlatListProps {
  containerStyle?: ViewStyle
  onPressOptions?: (file: FileModelType) => void
  onPressFile?: (file: FileModelType) => void
  onPressSortBy?: () => void
  onLayoutChange?: (val: boolean) => void
  setFileSelected?: (file: FileModelType, selected?: boolean) => void
  onLongPressFileHandler?: (file: FileModelType) => void
  setMultiSelectActive?: (val: boolean) => void
  onFileSelected?: (file: FileModelType, isSelected?: boolean) => void
  multiSelectActive?: boolean
  listLayout?: boolean
  marginTop?: number
  headerTitle?: string
  sortBy?: SortByType
  isMovingFiles?: boolean
  HeaderComponent?: any
  [x: string]: any
}

export const FileListView: FunctionComponent<Props> = ({
  data,
  containerStyle = {},
  onPressFile,
  onPressOptions,
  onPressSortBy,
  setMultiSelectActive,
  multiSelectActive,
  selectAllFiles,
  unSelectAllFiles,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onLayoutChange = () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onLongPressFileHandler = () => {},
  onFileSelected,
  listLayout = false,
  marginTop = 0,
  headerTitle,
  sortBy,
  sortByOrder,
  onPressSortByOrder,
  isMovingFiles,
  contentInsetBottom = 0,
  scrollViewStyle = {},
  onRefresh,
  refreshing,
  HeaderComponent,
  ...otherProps
}) => {
  const { width } = useWindowDimensions()
  const [isUnSelectAllActive, setIsUnselectAllActive] = useState<boolean>(null)

  const numOfColumns = useMemo(() => getNumOfCols(width, listLayout), [width, listLayout])
  const filterOrderSvg = useMemo(() => (sortByOrder === 'asc' ? 'arrow-up' : 'arrow-down'), [sortByOrder])
  const filterIcon = () => <SvgIcon name='filter' size={14} containerStyle={styles.iconLeft} />
  const filterOrderIcon = () => <SvgIcon name={filterOrderSvg} size={14} containerStyle={styles.iconFilterOrder} />

  function handlePressSelect() {
    setMultiSelectActive?.(!multiSelectActive)
    setIsUnselectAllActive(null)
  }

  function handlePressSelectAll() {
    if (isUnSelectAllActive) {
      setIsUnselectAllActive(null)
      unSelectAllFiles()
    } else {
      setIsUnselectAllActive(true)
      selectAllFiles()
    }
  }

  const renderFile = ({ item, index }) => {
    const lastColumnRightSide = (index + 1) % numOfColumns === 0
    return (
      <File
        file={item}
        key={item.path}
        onFileSelected={onFileSelected}
        onPressOptions={onPressOptions}
        listLayout={listLayout}
        onPress={onPressFile}
        multiSelectActive={multiSelectActive}
        onLongPressFileHandler={onLongPressFileHandler}
        // eslint-disable-next-line react-native/no-inline-styles
        wrapperStyle={{ flex: 1 / numOfColumns, paddingRight: lastColumnRightSide ? 0 : fileHorizontalSeparator }}
        isMovingFiles={isMovingFiles}
        refreshing={refreshing}
      />
    )
  }

  const renderListIconLayout = () => {
    return (
      <View style={[listLayout ? styles.paddingHorizontal : {}, styles.listHeader, { marginTop }]}>
        <View style={styles.listHeaderLeftContainer}>
          <TouchableOpacity
            style={styles.listHeaderLeftContainer}
            onPress={() => {
              setMultiSelectActive?.(false)
              onPressSortBy()
            }}>
            <Text style={styles.sortByText}>{translate(`sort_by:${sortBy}`) ?? translate('files:sort_by')}</Text>
            {filterIcon()}
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressSortByOrder}>{filterOrderIcon()}</TouchableOpacity>
        </View>
        <View style={styles.listHeaderRightContainer}>
          {multiSelectActive && (
            <Text style={styles.selectText} onPress={handlePressSelectAll}>
              {!isUnSelectAllActive
                ? translate('move_files_and_folders:select_all')
                : translate('move_files_and_folders:unselect_all')}
            </Text>
          )}
          <Text style={[styles.selectText, multiSelectActive && styles.cancelText]} onPress={handlePressSelect}>
            {multiSelectActive ? translate('cancel') : translate('select')}
          </Text>
          {listLayout ? (
            <SvgIcon name='list' size={22} containerStyle={styles.iconRight} onPress={() => onLayoutChange(false)} />
          ) : (
            <SvgIcon name='grid' size={23} containerStyle={styles.iconRight} onPress={() => onLayoutChange(true)} />
          )}
        </View>
      </View>
    )
  }

  const renderTitle = () => <Text style={[styles.headerTitle, { marginTop }]}>{headerTitle}</Text>
  const renderRefreshControl = onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : null
  return (
    <FlatList
      key={numOfColumns}
      numColumns={numOfColumns}
      columnWrapperStyle={numOfColumns > 1 && styles.columnWrapper}
      data={data}
      extraData={data}
      renderItem={renderFile}
      keyExtractor={item => item.uri}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={styles.marginBottom} />}
      contentInset={{ bottom: contentInsetBottom }}
      keyboardShouldPersistTaps={'never'}
      style={[styles.container, scrollViewStyle]}
      contentContainerStyle={[styles.contentContainer, containerStyle]}
      refreshControl={renderRefreshControl}
      ListHeaderComponent={
        <>
          {HeaderComponent}
          {data.length !== 0 ? (headerTitle ? renderTitle() : renderListIconLayout()) : null}
        </>
      }
      {...otherProps}
    />
  )
}
