import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useRoute, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { openDocumentPicker, launchImagePicker, getPrevPath, ImagePickerError } from '@utils'
import { ButtonCircle, EmptyFileList, FileListView, Header, Loader, showToast, MultiSelectActions } from '@components'
import { FileModelType } from '@models/stores/models'
import { SortByOrderType, SortByType } from '@models/stores'
import { useStores } from '@models'
import { SyncOps } from '@containers/sync-ops'
import { editFileOptions, editFolderOptions, getThumbnail, newFileOptions, sortByOptions } from '@config'
import { PopupMenu, MenuType, EnterNameModal, FileSharingModal, Confirmation, PermissionRequestModal } from '@modals'
import { TxOptionsKeyPath, translate, TxKeyPath } from '@i18n'
import { openSettings } from 'react-native-permissions'
import styles from './styles'
import { Animated, View } from 'react-native'
import { color } from '@theme/color'

const newOptions = newFileOptions('new_file')

export const DirectoryDetailsScreen = observer(() => {
  const { params } = useRoute<RouteParams>()
  const navigation = useNavigation<StackNavigationProp<any>>()
  const {
    fileListStore: {
      initialLoading,
      getFileList,
      getFetchMetadataStatus,
      fetchMetadataLastEpoch,
      createFolder,
      fetchDirMetadata,
      sortBy,
      sortByOrder,
      fetchFileMetaData,
      fetchFileMetaDataLoading,
    },
    fileOpsStore: {
      observeFileShare,
      observedFileShare,
      selectedFilesCount,
      loadingOpDelete,
      errorOpDelete,
      successOpDelete,
      resetAllFileOpsHandlerStates,
      deleteAllSelected,
      setFileSelected,
      setObservedFileShare,
      discardAllSelected,
      selectAllFiles,
      loadingOpMove,
    },
    uploaderStore: { uploadFileList, setDismissAllBackedUp },
    downloaderStore: { downloadFile, setDismissAllBackedUp: setDismissAllDownloaded },
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
    generalStore: { listLayoutStyle, setListLayoutStyle },
  } = useStores()

  const editOptions = useCallback((file: FileModelType, thumbnailName: string) => {
    return file.isDir ? editFolderOptions(file.name) : editFileOptions(file.name, thumbnailName)
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const [menuOptions, setMenuOptions] = useState<MenuOptions>()
  const [targetObject, setTargetObject] = useState<FileModelType>()
  const [targetOption, setTargetOption] = useState<TxOptionsKeyPath>()
  const [targetMenuType, setTargetMenuType] = useState<MenuType>()
  const [isVisibleOptionMenu, setIsVisibleOptionMenu] = useState<boolean>(false)
  const [isVisibleEnterName, setIsVisibleEnterName] = useState(false)
  const [fileList, setFileList] = useState<FileModelType>([])
  const [isVisibleFileSharing, setIsVisibleFileSharing] = useState(false)
  const [fileSharingType, setFileSharingType] = useState<string>()
  const [isVisibleRemoveConfirmation, setIsVisibleRemoveConfirmation] = useState(false)
  const [isPhotoLibraryPermissionModalVisible, setIsPhotoLibraryPermissionModalVisible] = useState(false)
  const [multiSelectActive, _setMultiSelectActive] = useState(false)
  const [isRevokePublicShareConfirmation, setIsRevokePublicShareConfirmation] = useState<boolean>(false)
  const [isRevokePublicShareConfirmationLoading, setIsRevokePublicShareConfirmationLoading] = useState<boolean>(false)

  function setMultiSelectActive(val) {
    _setMultiSelectActive(val)
    if (!val) discardAllSelected()
  }

  function setSelectAllFiles() {
    selectAllFiles(params.path)
  }

  function unSelectFiles() {
    discardAllSelected()
  }

  const isRoot = params.path === '/'
  const getFileListSorted = (sortBy?: SortByType, sortOrder?: SortByOrderType) =>
    getFileList(params.path, params.starred, sortBy, sortOrder)

  const emptyFileListAnimatedValue = useMemo(() => new Animated.Value(Number(!fileList?.length)), [])
  const fileListOpacity = fileList?.length
    ? emptyFileListAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      })
    : 1

  const { fetchMetadataLoading, fetchMetadataError } = useMemo(() => {
    return getFetchMetadataStatus(params.path)
  }, [fetchMetadataLastEpoch])

  useEffect(() => {
    if (multiSelectActive && !loadingOpDelete) {
      setMultiSelectActive(false)
    }
  }, [loadingOpDelete])

  const setTabBarVisible = (isVisible = true) =>
    navigation.dangerouslyGetParent()?.setOptions({
      tabBarVisible: isVisible,
    })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => setTabBarVisible(isRoot))
    return () => {
      setTabBarVisible(isRoot)
      unsubscribe()
      setMultiSelectActive(false)
    }
  }, [navigation])

  useEffect(() => {
    const list = getFileListSorted()
    if (list.length === 0) {
      fetchDirMetadata(params.path)
    } else setFileList(list)
    setMultiSelectActive(false)
  }, [loadingOpMove])

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
      setFileList(getFileListSorted(sortBy, sortByOrder))
    }
  }, [fetchMetadataLoading, fetchMetadataError])

  useEffect(() => {
    if (fileHandlerLoading) return
    if (fileHandlerError || errorOpDelete) return showToast('error', fileHandlerError || errorOpDelete)
    resetAllFileHandlingStates()
    resetAllFileOpsHandlerStates()
    if (fileHandlerSuccess || successOpDelete) {
      console.log({ fileHandlerSuccess, successOpDelete })
      showToast('success', fileHandlerSuccess || successOpDelete)
      fetchDirMetadata(params.path)
    }
  }, [fileHandlerLoading, fileHandlerError, fileHandlerSuccess, successOpDelete, errorOpDelete])

  const handleSortBy = () => {
    setMenuOptions(sortByOptions(sortBy, sortByOrder))
    setIsVisibleOptionMenu(true)
  }

  const handleSortByOrder = () => {
    setFileList(getFileListSorted(sortBy))
  }

  const headerSearchIcon = { name: 'search', onPress: () => null }
  const headerDotsIcon = { name: 'dots', onPress: () => null }

  const handlePressFile = (file: FileModelType) => {
    resetAllFileHandlingStates()
    if (file.isDir) {
      navigation.push('SubMain', { path: file.path, name: file.name, screen: 'DirectoryDetails' })
    } else {
      handlePressOptions(file)
    }
  }

  const setFileAsTargetObject = (file: FileModelType) => {
    const thumbnailName = getThumbnail(file.isDir, file.type)
    setMenuOptions(editOptions(file, thumbnailName))
    setTargetObject(file)
  }

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
    setIsVisibleFileSharing(true)
    targetObject.getPublicShare()
    setFileSharingType('public')
    observeFileShare(targetObject)
  }

  const toggleIsRevokePublicShareConfirmation = () => setIsRevokePublicShareConfirmation(prevState => !prevState)
  const toggleIsRevokePublicShareConfirmationLoading = () =>
    setIsRevokePublicShareConfirmationLoading(prevState => !prevState)

  const handlePrivateShare = () => {
    if (targetObject.isSharedPublic) {
      toggleIsRevokePublicShareConfirmation()
      return
    }
    setIsVisibleFileSharing(true)
    targetObject.getPrivateShare()
    setFileSharingType('private')
    observeFileShare(targetObject)
  }

  const revokeFileShare = async () => {
    await targetObject.revokePrivateShare()
    observeFileShare(targetObject)
    setTimeout(() => {
      setFileSharingType(undefined)
      setIsVisibleFileSharing(false)
    })
  }

  const onPressMoveTo = () => {
    const payload: any = {
      path: '/',
      fallBackPath: params.path,
      fallBackNavigator: 'Files',
      screen: 'MoveFilesAndFolders',
    }
    if (!multiSelectActive) {
      setFileSelected(targetObject, true)
    }
    navigation.push('SubMain', payload)
  }

  const onLongPressFileHandler = (file: FileModelType) => {
    if (!file.isDir) {
      setMultiSelectActive(true)
      setFileSelected(file, true)
    }
  }

  const handleEnterNameSubmit = name => {
    switch (targetMenuType) {
      case MenuType.FileOptions: {
        switch (targetOption) {
          case 'rename': {
            renameFile(params.path, targetObject, `${name}`)
            setFileAsTargetObject({})
            break
          }
        }
        break
      }
      case MenuType.FolderOptions: {
        switch (targetOption) {
          case 'rename': {
            renameFolder(params.path, targetObject, name)
            break
          }
        }
        break
      }
      case MenuType.New: {
        switch (targetOption) {
          case 'create_folder': {
            createFolder(params.path, name)
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
          case 'download': {
            downloadFile(targetObject)
            break
          }
          case 'rename': {
            setIsVisibleEnterName(true)
            break
          }
          case 'delete': {
            setIsVisibleRemoveConfirmation(true)
            break
          }
          case 'move_to': {
            onPressMoveTo()
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
            launchImagePicker()
              .then(assets => uploadFileList(assets as any, params.path))
              .catch((err: ImagePickerError) => {
                if (err.errorCode === 'permission') {
                  setIsPhotoLibraryPermissionModalVisible(true)
                } else {
                  showToast('error', err?.errorMessage)
                }
              })
            break
          }
          case 'create_folder': {
            setIsVisibleEnterName(true)
            break
          }
          case 'take_photo': {
            navigation.navigate('SubMain', { screen: 'CameraCapture', params: { destDir: params.path } })
            break
          }
          case 'upload_files': {
            await openDocumentPicker()
              .then(assets => uploadFileList(assets as any, params.path))
              .catch(err => showToast('error', err?.message))
            break
          }
        }
        break
      }
      case MenuType.SortBy: {
        setFileList(getFileListSorted(identifier as SortByType))
        break
      }
      default:
        break
    }
  }

  // eslint-disable-next-line no-unused-vars
  const headerIcons = () => {
    const icons = [headerSearchIcon]
    !isRoot && icons.push(headerDotsIcon)
    return icons
  }

  const onReceivedDeletePermission = () => {
    if (targetObject.isDir) {
      return deleteFolder(params.path, targetObject)
    }
    setObservedFileShare()
    deleteFile(params.path, targetObject)
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

  const titleForEnterNameModel = React.useMemo(() => {
    switch (targetOption) {
      case 'rename': {
        const fileOrFolder = targetObject.isDir ? 'folder' : 'file'
        return translate(`glossary:enter_${fileOrFolder}_name_to_rename`)
      }
      default:
        return translate('glossary:enter_folder_name')
    }
  }, [targetOption])

  const buttonTitleForEnterNameModel = React.useMemo(() => {
    const key: TxKeyPath = targetOption === 'rename' ? 'options:rename' : 'common:create'
    return key
  }, [targetOption])

  const nameForEnterNameModel = React.useMemo(() => {
    if (targetOption === 'rename' && targetObject) {
      return targetObject.name
    }
    return ''
  }, [targetOption, targetObject])

  const renderHeader = (
    <Header
      isLoading={fetchMetadataLoading && !refreshing && !fileHandlerLoading}
      navigation={navigation}
      title={params.name ?? undefined}
      onBackCallback={() => onRefresh(getPrevPath(params.path))}
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

  const renderModals = (
    <>
      <PermissionRequestModal
        modalVisible={isPhotoLibraryPermissionModalVisible}
        onClose={() => setIsPhotoLibraryPermissionModalVisible(false)}
        onPressPositiveButton={openSettings}
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
    <SyncOps
      containerStyle={listLayoutStyle ? styles.syncOpsContainer : styles.bannerPaddingGridView}
      fetchDirMetadata={() => fetchDirMetadata(params.path)}
      onPressManage={() => navigation.navigate('ManageFiles')}
    />
  )

  const onRefresh = (path: string = params.path, showLoader = true) => {
    if (showLoader) setRefreshing(true)
    fetchDirMetadata(path)
    setDismissAllBackedUp(true, false)
    setDismissAllDownloaded(true, false)
  }

  const bottomRender = multiSelectActive ? (
    <MultiSelectActions
      itemSelectedCount={selectedFilesCount}
      onDelete={deleteAllSelected}
      onMove={onPressMoveTo}
      loadingDelete={loadingOpDelete}
    />
  ) : (
    <>
      {!isVisibleOptionMenu && (
        <ButtonCircle icon={{ name: 'plus' }} containerStyle={styles.buttonCircleContainer} onPress={handlePressPlus} />
      )}
    </>
  )
  return (
    <>
      <View style={styles.renderHeaderContainer}>{renderHeader}</View>
      <Loader isVisible={fileHandlerLoading || loadingOpMove} />
      {renderModals}
      <Animated.View style={[styles.flex, { opacity: fileListOpacity }]}>
        {/* <Text>asa</Text> */}
        <FileListView
          data={fileList}
          extraData={[fileList, fileHandlerLoading, targetObject?.isSharedPublic, targetObject?.isSharedPrivate]}
          onPressFile={handlePressFile}
          onLongPressFileHandler={onLongPressFileHandler}
          onPressOptions={handlePressOptions}
          setMultiSelectActive={setMultiSelectActive}
          multiSelectActive={multiSelectActive}
          onFileSelected={setFileSelected}
          refreshing={refreshing}
          onRefresh={onRefresh}
          HeaderComponent={renderBanners}
          marginTop={0}
          selectAllFiles={setSelectAllFiles}
          unSelectAllFiles={unSelectFiles}
          ListEmptyComponent={
            <Animated.View style={[styles.topSpacing, { opacity: emptyFileListAnimatedValue }]}>
              <EmptyFileList onPress={handlePressPlus} />
            </Animated.View>
          }
          onLayoutChange={setListLayoutStyle}
          onPressSortBy={handleSortBy}
          listLayout={listLayoutStyle}
          sortBy={sortBy}
          sortByOrder={sortByOrder}
          onPressSortByOrder={handleSortByOrder}
          scrollViewStyle={!listLayoutStyle ? styles.scrollViewStyle : {}}
        />
      </Animated.View>
      {bottomRender}
    </>
  )
})
