import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { openSettings } from 'react-native-permissions'
import { useStores } from '@models'
import { checkPhotoAccess, requestPhotoAccess, RESULTS } from '@utils'
import { Button, Screen, SwitchInput, Header, MenuItem, MenuItemRightChevron } from '@components'
import { Confirmation, PermissionRequestModal } from '@modals'
import { translate } from '@i18n'
import styles from './styles'
import { color } from '@theme'

type ModalVisibleType = 'on_off' | 'photos' | 'videos' | false

export const CameraUploadsConfigurationsScreen = observer(() => {
  const navigation = useNavigation()
  const {
    generalStore: {
      backUpVideos,
      backUpPhotos,
      autoBackUpTurnedOn,
      setAutoBackUpTurnedOn,
      setBackUpPhotos,
      setBackUpVideos,
      backUpAllMedia,
      updateSyncConfig,
      setConfigChangeShowWarning,
      configChangeShowWarning,
    },
    uploaderStore,
  } = useStores()

  const [isPhotoLibraryPermissionModalVisible, setIsPhotoLibraryPermissionModalVisible] = useState(false)
  const [isDisableConfirmModalVisible, setDisableConfirmModalVisible] = useState<ModalVisibleType>(false)
  const isAutoSyncEmpty = uploaderStore.autoSync.queue.size === 0

  async function updateGlobalStateConfigFromLocalState() {
    await updateSyncConfig()
  }

  async function toggleBackupVideos() {
    setBackUpVideos(!backUpVideos)
    if (autoBackUpTurnedOn) await updateGlobalStateConfigFromLocalState()
  }

  async function toggleBackupPhotos() {
    setBackUpPhotos(!backUpPhotos)
    if (autoBackUpTurnedOn) await updateGlobalStateConfigFromLocalState()
  }

  const confirmModalCallback = async () => {
    // prevent modal warning from showing again,
    // if user accepts once
    setConfigChangeShowWarning(false)
    switch (isDisableConfirmModalVisible) {
      case 'on_off': {
        setAutoBackUpTurnedOn(!autoBackUpTurnedOn)
        break
      }
      case 'photos':
        await toggleBackupPhotos()
        break
      case 'videos':
        await toggleBackupVideos()
        break
    }
    await updateGlobalStateConfigFromLocalState()
    setDisableConfirmModalVisible(false)
  }

  const _setAutoBackUpTurnedOn = async () => {
    if (isAutoSyncEmpty || !configChangeShowWarning) {
      setAutoBackUpTurnedOn(!autoBackUpTurnedOn)
      updateGlobalStateConfigFromLocalState()
    } else setDisableConfirmModalVisible('on_off')
  }

  const handleSwitchBackUpPhotos = async (toValue: boolean) => {
    if (!isAutoSyncEmpty && configChangeShowWarning && !toValue) {
      setDisableConfirmModalVisible('photos')
    } else {
      await toggleBackupPhotos()
    }
  }

  const handleSwitchBackUpVideos = async (toValue: boolean) => {
    if (!isAutoSyncEmpty && configChangeShowWarning && !toValue) {
      setDisableConfirmModalVisible('videos')
    } else {
      await toggleBackupVideos()
    }
  }

  const renderPhotoGalleryPermissionRequest = () => {
    return (
      <PermissionRequestModal
        modalVisible={isPhotoLibraryPermissionModalVisible}
        onClose={() => setIsPhotoLibraryPermissionModalVisible(false)}
        onPressPositiveButton={openSettings}
      />
    )
  }

  const reactToPermission = status => {
    switch (status) {
      case RESULTS.LIMITED:
      case RESULTS.GRANTED: {
        _setAutoBackUpTurnedOn()
        break
      }
      case RESULTS.BLOCKED: {
        setIsPhotoLibraryPermissionModalVisible(true)
        break
      }
      case RESULTS.DENIED: {
        requestPhotoAccess().then(status => {
          // must return here to prevent requesting permission again
          if (status === RESULTS.DENIED) return
          reactToPermission(status)
        })
        break
      }
      default:
        break
    }
  }

  const checkAndAskForPermission = async () => {
    if (autoBackUpTurnedOn) {
      _setAutoBackUpTurnedOn()
    } else {
      reactToPermission(await checkPhotoAccess())
    }
  }

  const cameraUploadsBkpLabel = backUpAllMedia
    ? translate('camera_uploads:all_media')
    : translate('camera_uploads:new_media_only')

  return (
    <>
      <Header navigation={navigation} title={translate('camera_uploads:camera_uploads')} />
      {renderPhotoGalleryPermissionRequest()}
      <Screen paddingHorizontal={0}>
        <MenuItem
          title={translate('camera_uploads:backup_settings')}
          onPress={() => navigation.navigate('BackupConfig', { backUpAllMedia })}
          rightElement={<MenuItemRightChevron label={cameraUploadsBkpLabel} />}
        />
        <MenuItem
          title={translate('camera_uploads:include_photos')}
          rightElement={<SwitchInput onChangeValue={handleSwitchBackUpPhotos} enabled={backUpPhotos} />}
        />
        <MenuItem
          title={translate('camera_uploads:include_videos')}
          rightElement={<SwitchInput onChangeValue={handleSwitchBackUpVideos} enabled={backUpVideos} />}
        />
        <Button
          name={translate('camera_uploads:turn_auto_backup', { context: autoBackUpTurnedOn ? 'off' : 'on' })}
          onPress={checkAndAskForPermission}
          bgColor={autoBackUpTurnedOn ? color.palette.red : color.primary}
          marginTop={50}
          containerStyle={styles.button}
        />
        <Confirmation
          isVisible={isDisableConfirmModalVisible !== false}
          title={translate('camera_uploads:auto_sync_warning_turn_off_desc', {
            title: isDisableConfirmModalVisible === 'on_off' ? ' auto sync' : '',
            item: isDisableConfirmModalVisible === 'on_off' ? 'files' : isDisableConfirmModalVisible,
          })}
          positiveButtonTitle={translate('yes')}
          negativeButtonTitle={translate('no')}
          onPressPositive={confirmModalCallback}
          positiveButtonColor={color.error}
          onClose={() => setDisableConfirmModalVisible(false)}
        />
      </Screen>
    </>
  )
})
