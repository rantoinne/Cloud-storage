import React from 'react'
import { View, Image, SafeAreaView } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/core'
import { cameraUploads, logoBlueLarge } from '@images'
import { translate } from '@i18n'
import { useStores } from '@models'
import { Screen, MenuItem, MenuItemRightChevron, Text, Button } from '@components'
import styles from './styles'

export const FileSyncOptionsScreen = observer(() => {
  const navigator = useNavigation()
  const {
    generalStore: { isActualBackupTurnedOn, backUpPhotos, backUpVideos, autoBackUpTurnedOn, setUserAppStatus },
  } = useStores()

  const onTapCameraUploads = () => navigator.navigate('CameraUploadsConfig')

  const getAutoUploadDesc = () => {
    if (!autoBackUpTurnedOn) return translate('camera_uploads:auto_camera_upload_desc', { context: 'off' })
    if (backUpVideos && backUpPhotos) {
      // both types of media are turned on
      return translate('camera_uploads:auto_camera_upload_desc')
    } else {
      // only one type of media is turned on
      if (backUpPhotos) return translate('camera_uploads:auto_camera_upload_desc', { context: 'photos' })
      if (backUpVideos) return translate('camera_uploads:auto_camera_upload_desc', { context: 'videos' })
    }
    // both types of media are turned off while autoBackUpTurnedOn is set to false
    return translate('camera_uploads:auto_camera_upload_desc', { context: 'off' })
  }

  return (
    <Screen paddingHorizontal={0}>
      <SafeAreaView style={styles.container}>
        <View style={styles.body}>
          <Image style={styles.logo} source={logoBlueLarge} />
          <Text style={styles.logoText}>{translate('common:appName')}</Text>
          <Text style={styles.question}>{translate('fileSyncOptions:wantToAutomaticallyBackup')}</Text>
          <MenuItem
            title={translate('camera_uploads:camera_upload')}
            subtitle={getAutoUploadDesc()}
            leftIcon={cameraUploads}
            topBorder
            marginTop={40}
            onPress={onTapCameraUploads}
            rightElement={
              <MenuItemRightChevron
                label={translate(`glossary:${isActualBackupTurnedOn ? 'on' : 'off'}`)}
                turnedOn={isActualBackupTurnedOn}
              />
            }
          />
        </View>
        <Button
          name={isActualBackupTurnedOn ? translate('common:continue') : translate('common:skip')}
          onPress={() => setUserAppStatus('mainScreen')}
          filled={true}
          containerStyle={styles.skipButton}
        />
      </SafeAreaView>
    </Screen>
  )
})
