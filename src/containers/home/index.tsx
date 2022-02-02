import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { translate, TxOptionsKeyPath, TxKeyPath } from '@i18n'
import { ButtonCircle, FileListView, Header, NoBackupBanner, EmptyFileList, showToast, Loader } from '@components'
import { StackNavigationProp } from '@react-navigation/stack'
import { FileModelType } from '@models/stores/models'
import { useStores } from '@models'
import { SyncOps } from '../sync-ops'
import {
  launchImagePicker,
  openDocumentPicker,
  ImagePickerError,
  hasPhotoAccess,
  requestPhotoAccess,
  RESULTS,
  hasReadExternalStorageAccess,
  requestReadExternalStorageAccess,
} from '@utils'
import { editFileOptions, editFolderOptions, getThumbnail, newFileOptions } from '@config'
import { PopupMenu, MenuType, EnterNameModal, FileSharingModal, Confirmation, PermissionRequestModal } from '@modals'
import styles from './styles'
import { openSettings } from 'react-native-permissions'
import { LayoutAnimation, Animated, View } from 'react-native'
import { color } from '@theme/color'
import { ios } from '@utils/device'

const newOptions = newFileOptions('new_file')

export const HomeScreen = observer(() => {
  const requestStoragePermission = async () => {
    if (ios) return true

    const readExternalStorageAccess = await hasReadExternalStorageAccess()

    if (readExternalStorageAccess) return true

    const userResponse = await requestReadExternalStorageAccess()
    return userResponse['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
  }

  const navigation = useNavigation<StackNavigationProp<any>>()
  const {
    fileListStore: {
      initialLoading,
      getFileList,
      getFetchMetadataStatus,
      fetchMetadataLastEpoch,
      createFolder,
      fetchDirMetadata,
      fetchFileMetaData,
      fetchFileMetaDataLoading,
    },
    fileOpsStore: { observeFileShare, observedFileShare, setObservedFileShare, loadingOpMove, setFileSelected },
    fileHandlerStore: {
      renameFolder,
      renameFile,
      deleteFolder,
      deleteFile,
      fileHandlerLoading,
      fileHandlerError,
      fileHandlerSuccess,
      resetAllFileHandlingStates,
    },
    uploaderStore: { uploadFileList, setDismissAllBackedUp },
    downloaderStore: { downloadFile, setDismissAllBackedUp: setDismissAllDownloaded },
    generalStore: { backupMnemonicStatus, setBackupMnemonicStatus },
  } = useStores()

  const editOptions = useCallback((file: FileModelType, thumbnailName: string) => {
    return file.isDir ? editFolderOptions(file.name) : editFileOptions(file.name, thumbnailName)
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const [menuOptions, setMenuOptions] = useState<MenuOptions>()
  const [targetObject, setTargetObject] = useState<FileModelType>()
  const [targetOption, setTargetOption] = useState<TxOptionsKeyPath>()
  const [targetMenuType, setTargetMenuType] = useState<MenuType>()
  const [isVisibleOptionMenu, setIsVisibleOptionMenu] = useState(false)
  const [isVisibleEnterName, setIsVisibleEnterName] = useState(false)
  const [fileList, setFileList] = useState<FileModelType>([])
  const [isVisibleFileSharing, setIsVisibleFileSharing] = useState(false)
  const [fileSharingType, setFileSharingType] = useState<string>()
  const [isVisibleRemoveConfirmation, setIsVisibleRemoveConfirmation] = useState(false)
  const [isPhotoLibraryPermissionModalVisible, setIsPhotoLibraryPermissionModalVisible] = useState(false)
  const [isExternalStoragePermissionModal, setIsExternalStoragePermissionModal] = useState(
    () => !requestStoragePermission(),
  )
  const [noBackupBannerLayoutHeight, setNoBackupBannerLayoutHeight] = useState<number>(0)
  const [isRevokePublicShareConfirmation, setIsRevokePublicShareConfirmation] = useState<boolean>(false)
  const [isRevokePublicShareConfirmationLoading, setIsRevokePublicShareConfirmationLoading] = useState<boolean>(false)
  const backupMnemonicStatusAnimatedValue = useMemo(() => new Animated.Value(0), [])
  const emptyFileListAnimatedValue = useMemo(() => new Animated.Value(Number(!fileList?.length)), [])
  const fileListOpacity = fileList?.length
    ? emptyFileListAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      })
    : 1

  const { fetchMetadataLoading, fetchMetadataError } = useMemo(() => {
    return getFetchMetadataStatus('/')
  }, [fetchMetadataLastEpoch, loadingOpMove])

  const setTabBarVisible = (isVisible = true) =>
    navigation.dangerouslyGetParent()?.setOptions({
      tabBarVisible: isVisible,
    })

  useEffect(() => {
    const list = getFileList('/', false, 'uploaded', 'desc')
    if (list.length === 0) {
      fetchDirMetadata('/')
    } else setFileList(list)
    return navigation.addListener('focus', () => setTabBarVisible(true))
  }, [loadingOpMove])

  useEffect(() => {
    const toValue = Number(backupMnemonicStatus === 'notBackedUp')
    if (toValue) {
      Animated.timing(backupMnemonicStatusAnimatedValue, {
        toValue,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } else {
      backupMnemonicStatusAnimatedValue.setValue(0)
    }
  }, [backupMnemonicStatus])

  useEffect(() => {
    const toValue = Number(!fileList.length)
    Animated.timing(emptyFileListAnimatedValue, {
      toValue,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [fileList.length])

  useEffect(() => {
    if (fetchMetadataLoading) return
    if (refreshing) setRefreshing(false)
    if (!fetchMetadataError) {
      setFileList(getFileList('/', false, 'uploaded', 'desc'))
    }
  }, [fetchMetadataLoading, fetchMetadataError])

  useEffect(() => {
    if (fileHandlerLoading) return
    if (fileHandlerError) showToast('error', fileHandlerError)
    resetAllFileHandlingStates()
    if (fileHandlerSuccess) {
      showToast('success', fileHandlerSuccess)
      fetchDirMetadata('/')
    }
  }, [fileHandlerLoading, fileHandlerError, fileHandlerSuccess])

  const setFileAsTargetObject = (file: FileModelType) => {
    const thumbnailName = getThumbnail(file.isDir, file.type)
    setMenuOptions(editOptions(file, thumbnailName))
    setTargetObject(file)
  }

  // TODO: This shouldn't be entirely duplicated like this here
  const handlePressOptions = (file: FileModelType) => {
    setFileAsTargetObject(file)
    setIsVisibleOptionMenu(true)
  }

  const handlePressPlus = () => {
    setMenuOptions(newOptions)
    setTargetObject({})
    setIsVisibleOptionMenu(true)
  }

  const handlePublicShare = () => {
    observeFileShare(targetObject)
    targetObject.getPublicShare()
    setFileSharingType('public')
    setIsVisibleFileSharing(true)
  }

  const toggleIsRevokePublicShareConfirmation = () => setIsRevokePublicShareConfirmation(prevState => !prevState)
  const toggleIsRevokePublicShareConfirmationLoading = () =>
    setIsRevokePublicShareConfirmationLoading(prevState => !prevState)

  const handlePrivateShare = () => {
    if (targetObject.isSharedPublic) {
      toggleIsRevokePublicShareConfirmation()
      return
    }
    observeFileShare(targetObject)
    targetObject.getPrivateShare()
    setFileSharingType('private')
    setIsVisibleFileSharing(true)
  }

  const revokeFileShare = () => {
    setIsVisibleFileSharing(false)
    targetObject.revokePrivateShare()
  }

  const handleEnterNameSubmit = name => {
    switch (targetMenuType) {
      case MenuType.FileOptions: {
        switch (targetOption) {
          case 'rename': {
            renameFile('/', targetObject, `${name}`)
            setFileAsTargetObject({})
            break
          }
        }
        break
      }
      case MenuType.FolderOptions: {
        switch (targetOption) {
          case 'rename': {
            renameFolder('/', targetObject, name)
            break
          }
        }
        break
      }
      case MenuType.New: {
        switch (targetOption) {
          case 'create_folder': {
            createFolder('/', name)
            break
          }
        }
        break
      }
      default:
        break
    }
  }

  const handleOptionSelect = async (menuType: MenuType, identifier: TxOptionsKeyPath) => {
    setTargetOption(identifier)
    setTargetMenuType(menuType)

    switch (menuType) {
      case MenuType.FileOptions: {
        switch (identifier) {
          case 'public_share': {
            handlePublicShare()
            break
          }
          case 'private_share': {
            handlePrivateShare()
            break
          }
          case 'rename': {
            setIsVisibleEnterName(true)
            break
          }
          case 'download': {
            downloadFile(targetObject)
            break
          }
          case 'delete': {
            setIsVisibleRemoveConfirmation(true)
            break
          }
          case 'move_to': {
            const payload: any = {
              path: '/',
              fallBackPath: '/',
              fallBackNavigator: 'Home',
              screen: 'MoveFilesAndFolders',
            }
            setFileSelected(targetObject, true)
            navigation.push('SubMain', payload)
            break
          }
        }
        break
      }
      case MenuType.FolderOptions: {
        switch (identifier) {
          case 'rename': {
            setIsVisibleEnterName(true)
            break
          }
          case 'delete': {
            setIsVisibleRemoveConfirmation(true)
            break
          }
        }
        break
      }
      case MenuType.New: {
        switch (identifier) {
          case 'upload_photo': {
            if ((await hasPhotoAccess()) || (await requestPhotoAccessPermission())) {
              launchImagePicker()
                .then(assets => uploadFileList(assets as any, '/'))
                .catch((err: ImagePickerError) => {
                  showToast('error', err?.errorMessage)
                })
            }
            break
          }
          case 'create_folder': {
            setIsVisibleEnterName(true)
            break
          }
          case 'take_photo': {
            navigation.navigate('SubMain', { screen: 'CameraCapture', params: { destDir: '/' } })
            break
          }
          case 'upload_files': {
            if ((await hasPhotoAccess()) || (await requestPhotoAccessPermission())) {
              openDocumentPicker()
                .then(assets => uploadFileList(assets as any, '/'))
                .catch(err => showToast('error', err?.message))
            }
            break
          }
        }
        break
      }
      default:
        break
    }
  }

  const requestPhotoAccessPermission = (): Promise<boolean> => {
    return new Promise(async resolve => {
      const status = await requestPhotoAccess()
      switch (status) {
        case RESULTS.LIMITED:
        case RESULTS.GRANTED: {
          resolve(true)
          break
        }
        case RESULTS.BLOCKED: {
          setIsPhotoLibraryPermissionModalVisible(true)
          break
        }
        case RESULTS.DENIED: {
          resolve(false)
          break
        }
        default:
          break
      }
    })
  }

  const onReceivedDeletePermission = () => {
    if (targetObject.isDir) {
      return deleteFolder('/', targetObject)
    }
    setObservedFileShare()
    deleteFile('/', targetObject)
  }

  const handlePressFile = (file: FileModelType) => {
    resetAllFileHandlingStates()
    if (file.isDir) {
      navigation.push('SubMain', { path: file.path, name: file.name, screen: 'DirectoryDetails' })
    } else {
      handlePressOptions(file)
    }
  }

  const handleLayoutAnimator = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

  const onPressRemindMeLater = () => {
    handleLayoutAnimator()
    setBackupMnemonicStatus('remindMeLater')
  }

  function onNoBackupBannerLayout(event: any) {
    if (noBackupBannerLayoutHeight) return
    setNoBackupBannerLayoutHeight(event.nativeEvent.layout.height)
  }

  const onPermittedRevokePublicShare = () => {
    toggleIsRevokePublicShareConfirmationLoading()
    revokeFileShare()
  }

  const fetchFileMetaDataHandler = async () => {
    await fetchFileMetaData(targetObject.path, targetObject)
  }

  useEffect(() => {
    if (isRevokePublicShareConfirmationLoading && !targetObject?.isSharedPublic) {
      toggleIsRevokePublicShareConfirmationLoading()
      toggleIsRevokePublicShareConfirmation()
      // This is needed to present modal on modal
      setTimeout(handlePrivateShare, 500)
    }
  }, [targetObject?.isSharedPublic, isRevokePublicShareConfirmationLoading])

  const titleForEnterNameModel = useMemo(() => {
    switch (targetOption) {
      case 'rename': {
        const fileOrFolder = targetObject.isDir ? 'folder' : 'file'
        return translate(`glossary:enter_${fileOrFolder}_name_to_rename`)
      }
      default:
        return translate('glossary:enter_folder_name')
    }
  }, [targetOption])

  const buttonTitleForEnterNameModel = useMemo(() => {
    const key: TxKeyPath = targetOption === 'rename' ? 'options:rename' : 'common:create'
    return key
  }, [targetOption])

  const nameForEnterNameModel = useMemo(() => {
    if (targetOption === 'rename' && targetObject) {
      return targetObject.name
    }
    return ''
  }, [targetOption, targetObject])

  const renderHeader = (
    <Header
      isLoading={fetchMetadataLoading && !refreshing && !initialLoading && !fileHandlerLoading}
      navigation={navigation}
    />
  )

  if (initialLoading) {
    return (
      <>
        {renderHeader}
        <Loader isVisible={initialLoading} />
      </>
    )
  }
  const onPermissionRequestModalClose = () => {
    setIsExternalStoragePermissionModal(true)
  }

  const renderModals = (
    <>
      <PermissionRequestModal
        modalVisible={isPhotoLibraryPermissionModalVisible}
        onClose={() => setIsPhotoLibraryPermissionModalVisible(false)}
        onPressPositiveButton={openSettings}
      />
      <PermissionRequestModal
        modalVisible={isExternalStoragePermissionModal}
        onClose={onPermissionRequestModalClose}
        title={translate('common:permission_needed')}
        description={translate('common:is_granted_permission_failed')}
      />
      <PopupMenu
        menuOptions={menuOptions}
        isVisible={isVisibleOptionMenu}
        onOptionSelect={handleOptionSelect}
        onCloseCallback={() => setIsVisibleOptionMenu(false)}
        fetchFileMetaData={fetchFileMetaDataHandler}
      />
      <EnterNameModal
        title={titleForEnterNameModel}
        name={nameForEnterNameModel}
        isVisible={isVisibleEnterName}
        onDismiss={() => setIsVisibleEnterName(false)}
        buttonTitle={buttonTitleForEnterNameModel}
        onPress={handleEnterNameSubmit}
      />
      <FileSharingModal
        isVisible={isVisibleFileSharing}
        shareObject={observedFileShare}
        sharingType={fileSharingType}
        onDismiss={() => setIsVisibleFileSharing(false)}
        onPressRevoke={revokeFileShare}
        fetchFileMetaData={fetchFileMetaDataHandler}
        fetchFileMetaDataLoading={fetchFileMetaDataLoading}
      />
      <Confirmation
        isVisible={isVisibleRemoveConfirmation && targetOption === 'delete'}
        title={translate('remove_files:remove_confirmation', { filename: targetObject?.name ?? '' })}
        positiveButtonTitle={translate('yes')}
        negativeButtonTitle={translate('no')}
        onPressPositive={onReceivedDeletePermission}
        onClose={() => setIsVisibleRemoveConfirmation(false)}
      />
      <Confirmation
        isVisible={isRevokePublicShareConfirmation}
        loading={isRevokePublicShareConfirmationLoading}
        title={translate('file_sharing:revoke_public_share_confirmation_on_private_share')}
        positiveButtonTitle={translate('file_sharing:revoke_public_share_confirmation_yes')}
        negativeButtonTitle={translate('file_sharing:revoke_public_share_confirmation_no')}
        positiveButtonColor={color.error}
        onClose={toggleIsRevokePublicShareConfirmation}
        overRideOnPressPositive={onPermittedRevokePublicShare}
      />
    </>
  )

  const renderBanners = (
    <View style={styles.headerTopSpacing}>
      <Animated.View style={{ opacity: backupMnemonicStatusAnimatedValue }}>
        <View onLayout={onNoBackupBannerLayout}>
          <NoBackupBanner
            isVisible={backupMnemonicStatus === 'notBackedUp'}
            onPressBackup={() => navigation.navigate('MnemonicPhrase')}
            onPressRemindMeLater={onPressRemindMeLater}
            marginTop={0}
          />
        </View>
      </Animated.View>
      <SyncOps
        containerStyle={styles.syncOpsContainer}
        fetchDirMetadata={() => fetchDirMetadata('/')}
        onPressManage={() => navigation.navigate('ManageFiles')}
      />
    </View>
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchDirMetadata('/')
    setDismissAllBackedUp(true, false)
    setDismissAllDownloaded(true, false)
  }

  return (
    <>
      <View style={styles.renderHeaderContainer}>{renderHeader}</View>
      <Loader isVisible={fileHandlerLoading || loadingOpMove} />
      {renderModals}
      <Animated.View style={[styles.flex, { opacity: fileListOpacity }]}>
        <FileListView
          data={fileList}
          extraData={[fileList, fileHandlerLoading, targetObject?.isSharedPublic, targetObject?.isSharedPrivate]}
          headerTitle={translate('home:recent_viewed_files')}
          onPressFile={handlePressFile}
          onPressOptions={handlePressOptions}
          listLayout={true}
          refreshing={refreshing}
          onRefresh={onRefresh}
          HeaderComponent={renderBanners}
          marginTop={9}
          ListEmptyComponent={
            <Animated.View style={[styles.topSpacing, { opacity: emptyFileListAnimatedValue }]}>
              <EmptyFileList onPress={handlePressPlus} />
            </Animated.View>
          }
        />
      </Animated.View>
      {!isVisibleOptionMenu && (
        <ButtonCircle icon={{ name: 'plus' }} containerStyle={styles.buttonCircleContainer} onPress={handlePressPlus} />
      )}
    </>
  )
})
