import React, { FunctionComponent, useEffect, useMemo, useRef } from 'react'
import { View, Text } from 'react-native'
import styles from './styles'
import { SvgIcon } from '@components/svg-icon'
import { translate } from '@i18n'
import { ButtonBlue } from '@components'
import { Modalize } from 'react-native-modalize'

type Props = {
  itemSelectedCount?: number
  onMove?: () => void
  onDelete?: () => void
  loadingDelete?: boolean
}

export const MultiSelectActions: FunctionComponent<Props> = ({
  itemSelectedCount,
  onMove,
  onDelete,
  loadingDelete = false,
}) => {
  const modalizeRef = useRef<Modalize>()
  const disabled = itemSelectedCount <= 0

  useEffect(() => {
    if (!loadingDelete) modalizeRef.current?.close()
  }, [loadingDelete])

  const showDeleteConfirm = (val?: boolean) => {
    if (disabled) return
    if (val) {
      modalizeRef.current?.open()
    } else modalizeRef.current?.close()
  }

  const leftIcon = useMemo(
    () => (
      <SvgIcon
        containerStyle={[styles.actionIconContainer]}
        style={disabled && styles.opacity20}
        disabled={disabled}
        onPress={onMove}
        name={'move_to'}
        size={20}
      />
    ),
    [disabled],
  )

  const rightIcon = useMemo(
    () => (
      <SvgIcon
        containerStyle={[styles.actionIconContainer]}
        style={disabled && styles.opacity20}
        disabled={disabled}
        onPress={() => showDeleteConfirm(true)}
        name={'trash-selected'}
        size={18}
      />
    ),
    [disabled],
  )

  const renderDeleteConfirm = useMemo(
    () => (
      <View style={styles.deleteContainer}>
        <Text style={styles.buttonConfirmation}>{translate('files:delete_confirmation')}</Text>
        <ButtonBlue
          name={
            itemSelectedCount == 0
              ? `${translate('files:deleted_item').toUpperCase()}`
              : `${translate('files:delete_item', { count: itemSelectedCount }).toUpperCase()}`
          }
          containerStyle={styles.buttonStyle}
          onPress={onDelete}
          loading={loadingDelete}
          disabled={loadingDelete}
        />
        <Text onPress={() => !loadingDelete && showDeleteConfirm(false)} style={styles.cancelText}>
          {translate('cancel')}
        </Text>
      </View>
    ),
    [itemSelectedCount, loadingDelete],
  )

  const renderModalDeleteConfirm = useMemo(
    () => (
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight={true}
        useNativeDriver={true}
        modalStyle={styles.modalStyle}
        panGestureEnabled={!loadingDelete}
        closeOnOverlayTap={!loadingDelete}>
        {renderDeleteConfirm}
      </Modalize>
    ),
    [itemSelectedCount, loadingDelete],
  )

  return (
    <>
      <View style={styles.container}>
        {leftIcon}
        <Text style={styles.selectText}>{translate('files:select_items')}</Text>
        {rightIcon}
      </View>
      {renderModalDeleteConfirm}
    </>
  )
}
