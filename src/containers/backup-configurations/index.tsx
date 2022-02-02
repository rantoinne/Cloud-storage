import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Screen, SvgIcon, Header, MenuItem } from '@components'
import { translate } from '@i18n'
import { useStores } from '@models'
import { color } from '@theme'
import { Confirmation } from '@modals'

type ModalVisibleType = 'all' | 'new_only' | false

export const BackupConfigurationScreen = observer(() => {
  const navigation = useNavigation()
  const {
    uploaderStore,
    generalStore: { setConfigChangeShowWarning, configChangeShowWarning, setBackUpAllMedia: setBackAllMediaStore },
  } = useStores()
  const { params } = useRoute<RouteParams>()
  const [isDisableConfirmModalVisible, setDisableConfirmModalVisible] = useState<ModalVisibleType>(false)
  const [_backUpAllMedia, setBackUpAllMedia] = useState(params.backUpAllMedia)
  const isAutoSyncEmpty = uploaderStore.autoSync.queue.size === 0

  useEffect(() => {
    return () =>
      DeviceEventEmitter.emit('event.setBackUpAllMedia', {
        backUpAllMedia: _backUpAllMedia,
      })
  }, [_backUpAllMedia])

  const confirmModalCallback = () => {
    // prevent modal warning from showing again,
    // if user accepts once
    setConfigChangeShowWarning(false)
    if (isDisableConfirmModalVisible) {
      setBackUpAllMedia(isDisableConfirmModalVisible === 'all')
    }
    setDisableConfirmModalVisible(false)
  }

  const _setBackUpAllMedia = (val: ModalVisibleType) => {
    if (isAutoSyncEmpty || !configChangeShowWarning) {
      setBackUpAllMedia(val === 'all')
    } else {
      setDisableConfirmModalVisible(val)
    }
    setBackAllMediaStore(val === 'all')
  }

  const renderCheckMark = isVisible =>
    isVisible ? <SvgIcon name={'check'} size={16} stroke={color.palette.black} /> : null

  return (
    <>
      <Header navigation={navigation} title={translate('camera_uploads:backup_settings')} />
      <Screen paddingHorizontal={0}>
        <MenuItem
          title={translate('camera_uploads:all_media')}
          subtitle={translate('camera_uploads:all_media_desc')}
          onPress={() => _setBackUpAllMedia('all')}
          rightElement={renderCheckMark(_backUpAllMedia)}
        />
        <MenuItem
          title={translate('camera_uploads:new_media_only')}
          subtitle={translate('camera_uploads:new_media_only_desc')}
          onPress={() => _setBackUpAllMedia('new_only')}
          rightElement={renderCheckMark(!_backUpAllMedia)}
        />
        <Confirmation
          isVisible={isDisableConfirmModalVisible !== false}
          title={translate('camera_uploads:auto_sync_warning_turn_off_desc')}
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
