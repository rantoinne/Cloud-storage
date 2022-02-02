import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { View, Image } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import Modal from 'react-native-modal'
import { translate } from '@i18n'
import { Button, ButtonWhiteBlueBorder, Loader, SvgIcon, Text } from '@components'
import { logoBlueLarge } from '@images'
import { SharingModelType } from '@models/stores/models'
import styles from './styles'
import { Confirmation } from '@modals/confirmation'
import { color } from '@theme/color'

type Props = {
  isVisible: boolean
  shareObject: SharingModelType
  sharingType: string
  onPressRevoke: () => void
  onDismiss: () => void
  fetchFileMetaData: () => Promise<void>
  fetchFileMetaDataLoading: boolean
}

export const FileSharingModal: FunctionComponent<Props> = ({
  isVisible,
  shareObject = {},
  sharingType = 'public',
  onPressRevoke,
  onDismiss,
  fetchFileMetaDataLoading,
  fetchFileMetaData,
}) => {
  const sharing = sharingType === 'public' ? shareObject.public : shareObject.private
  const { fetchShareLoading, fetchShareError, link, revokeShareLoading } = sharing || {}
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false)

  const handlePressCopy = () => {
    if (!link) return
    Clipboard.setString(link as string)
    onDismiss()
  }

  const handlePressRevoke = () => {
    setShowRevokeConfirmation(true)
  }

  const handleConfirmRevoke = () => {
    if (!link) return
    setShowRevokeConfirmation(false)
    onPressRevoke()
  }

  useEffect(() => {
    if (isVisible) {
      fetchFileMetaData()
    }
  }, [isVisible])

  const renderRevokeConfirmation = useMemo(() => {
    return (
      <Confirmation
        isVisible={showRevokeConfirmation}
        title={translate('file_sharing:revoke_public_share_confirmation')}
        positiveButtonTitle={translate('file_sharing:revoke_public_share_confirmation_yes')}
        negativeButtonTitle={translate('file_sharing:revoke_public_share_confirmation_no')}
        positiveButtonColor={color.error}
        onClose={() => setShowRevokeConfirmation(false)}
        overRideOnPressPositive={handleConfirmRevoke}
      />
    )
  }, [showRevokeConfirmation])

  const loading = revokeShareLoading || fetchShareLoading || fetchFileMetaDataLoading

  return (
    <Modal style={styles.modal} isVisible={isVisible} onBackdropPress={onDismiss}>
      <View style={styles.contentContainer}>
        <Image style={styles.headerImage} source={logoBlueLarge} />
        <Text style={styles.title}>{translate('file_sharing:title')}</Text>
        <Text style={styles.subtitle}>{translate('file_sharing:anyone_with')}</Text>
        <View style={styles.linkContainer}>
          <Loader isVisible={loading} />
          <View style={styles.linkTextContainer}>
            <Text numberOfLines={1} lineBreakMode={'tail'}>
              {link}
            </Text>
          </View>
          {!loading && <SvgIcon name={'copy-blue'} size={18} onPress={handlePressCopy} />}
        </View>
        <View style={styles.footer}>
          <Button
            containerStyle={styles.positiveBtnContainer}
            nameStyle={styles.positiveBtnTitle}
            name={translate('file_sharing:copy_url')}
            icon={{ name: 'copy-white' }}
            disabled={loading}
            onPress={handlePressCopy}
          />
          {sharingType === 'public' && (
            <ButtonWhiteBlueBorder
              containerStyle={styles.negativeBtnContainer}
              nameStyle={styles.negativeBtnTitle}
              name={translate('file_sharing:revoke')}
              icon={{ name: 'stop' }}
              disabled={loading}
              onPress={handlePressRevoke}
            />
          )}
        </View>
        {fetchShareError && <Text style={styles.textError}>{fetchShareError}</Text>}
      </View>
      {renderRevokeConfirmation}
    </Modal>
  )
}
