import React, { useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { Linking, Platform, View } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { Screen, Header, StorageTracker, MenuItem, MenuItemRightChevron } from '@components'
import { useStores } from '@models'
import { translate } from '@i18n'
import { helpCenter, getSupport, cameraUploads, logout, about } from '@images'
import { useIsFocused } from '@react-navigation/native'
import { version } from '../../../package.json'
import { color } from '@theme'
import styles from './styles'

const isIOS = Platform.OS === 'ios'

const supportUrl = `mailto:help@opacity.io?subject=${translate('profile:support_message_subject')}${
  isIOS ? 'iOS' : 'Android'
} v${version}&body=${translate('profile:support_message_body')}`

export const ProfileScreen = observer(() => {
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const {
    generalStore: { isActualBackupTurnedOn, backUpPhotos, backUpVideos, autoBackUpTurnedOn },
    authStore: { signOut, user, updateUser, updateUserLoading },
  } = useStores()

  useEffect(() => {
    if (isFocused) {
      updateUser(false)
    }
  }, [isFocused])

  const getAutoUploadDesc = useMemo(() => {
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
  }, [autoBackUpTurnedOn, backUpVideos, backUpPhotos])

  const menuList = useMemo(
    () => [
      {
        title: translate('profile:camera_uploads'),
        subtitle: getAutoUploadDesc,
        leftIcon: cameraUploads,
        onPress: () => navigation.navigate('SubMain', { screen: 'CameraUploadsConfig' }),
        rightElement: (
          <MenuItemRightChevron
            label={translate(`glossary:${isActualBackupTurnedOn ? 'on' : 'off'}`)}
            turnedOn={isActualBackupTurnedOn}
          />
        ),
      },
      {
        title: translate('profile:get_support'),
        subtitle: translate('profile:get_support_desc'),
        leftIcon: getSupport,
        onPress: () => Linking.openURL(supportUrl),
        rightElement: <MenuItemRightChevron />,
      },
      {
        title: translate('profile:help_center'),
        leftIcon: helpCenter,
        onPress: () => navigation.navigate('SubMain', { screen: 'HelpCenter' }),
        rightElement: <MenuItemRightChevron />,
      },
      {
        title: translate('profile:about'),
        leftIcon: about,
        onPress: () => navigation.navigate('SubMain', { screen: 'About' }),
        rightElement: <MenuItemRightChevron />,
      },
      {
        title: translate('profile:logout'),
        textColor: color.palette.red,
        leftIcon: logout,
        rightIcon: 'arrow-right',
        onPress: signOut,
        rightElement: <MenuItemRightChevron />,
      },
    ],
    [isActualBackupTurnedOn],
  )

  const renderItem = ({ title, subtitle, textColor, leftIcon, onPress, rightElement }) => (
    <MenuItem
      key={title}
      title={title}
      subtitle={subtitle}
      textColor={textColor}
      leftIcon={leftIcon}
      onPress={onPress}
      rightElement={rightElement}
    />
  )

  // TODO: Keep this removed until auto-sync actually lands
  const disableSync = false
  const _menuList = disableSync ? menuList.slice(1) : menuList
  return (
    <>
      <Header navigation={navigation} />
      <Screen paddingHorizontal={0} onRefresh={updateUser} refreshing={updateUserLoading}>
        <StorageTracker
          isVisible={true}
          usedStorage={user?.account.storageUsed}
          totalStorage={user?.account.storageLimit}
          containerStyle={styles.storageTrackerContainer}
        />
        <View style={styles.verticalBuffer} />
        {_menuList.map(renderItem)}
      </Screen>
    </>
  )
})
