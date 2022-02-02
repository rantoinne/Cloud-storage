import React, { FunctionComponent, useRef, useMemo, useEffect } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { color } from '@theme'
import { SvgIcon } from '@components/svg-icon'
import styles from './styles'

export enum MenuType {
  // eslint-disable-next-line no-unused-vars
  New = 1,
  // eslint-disable-next-line no-unused-vars
  SortBy,
  // eslint-disable-next-line no-unused-vars
  FileOptions,
  // eslint-disable-next-line no-unused-vars
  FolderOptions,
}

export type MenuItem = {
  identifier?: string
  icon?: { name: string; size: number }
  title?: string
  tint?: string
  isCurrent?: boolean
  order?: string
}

type Props = {
  menuOptions?: MenuOptions
  isVisible?: boolean
  onOptionSelect?: (menuType?: MenuType, identifier?: string) => void
  onCloseCallback?: () => void
  fetchFileMetaData: () => Promise<void>
}

export const PopupMenu: FunctionComponent<Props> = ({
  menuOptions = { items: [] },
  isVisible = false,
  onOptionSelect,
  onCloseCallback,
  fetchFileMetaData,
}) => {
  const modalizeRef = useRef<Modalize>()
  const [headerItem, list] = useMemo(() => {
    const _list = [...menuOptions.items]
    return [_list.shift(), _list]
  }, [menuOptions])

  useEffect(() => {
    if (isVisible) {
      fetchFileMetaData()
      modalizeRef.current.open()
    } else {
      modalizeRef.current.close()
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
    }
  }, [isVisible])

  const renderItem = ({ identifier, title, icon, tint, isCurrent, order }: MenuItem) => {
    return (
      <TouchableOpacity
        style={styles.modalRowContent}
        key={identifier}
        onPress={() => {
          modalizeRef.current.close()
          onOptionSelect(menuOptions.type, identifier)
        }}>
        <View style={styles.flexRowStart}>
          {isCurrent ? (
            <SvgIcon name={order === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} stroke={color.palette.blue} />
          ) : (
            <View style={styles.emptyBox} />
          )}
          <View style={styles.leftSideItemContainer}>
            {icon && <SvgIcon name={icon.name} size={icon.size} />}
            <Text style={{ ...styles.modalRowContentText, color: tint ?? color.darkGrey }}>{title}</Text>
          </View>
        </View>
        {isCurrent && <SvgIcon name={'check'} size={20} stroke={color.palette.blue} />}
      </TouchableOpacity>
    )
  }

  const renderHeaderContainer = () => {
    if (!headerItem) return null
    const { icon, title } = headerItem
    return (
      <View style={[styles.headerContainer, icon ? styles.leftedHeader : styles.centeredHeader]}>
        {icon && <SvgIcon name={icon.name} size={icon.size} />}
        <Text style={styles.modalTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    )
  }

  return (
    <Modalize
      ref={modalizeRef}
      adjustToContentHeight={true}
      useNativeDriver={true}
      modalStyle={styles.modalStyle}
      onClosed={onCloseCallback}>
      <>
        {renderHeaderContainer()}
        <View style={styles.contentWrapper}>{list.map(renderItem)}</View>
      </>
    </Modalize>
  )
}
