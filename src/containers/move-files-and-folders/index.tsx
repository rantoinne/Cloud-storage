import React, { useEffect, useMemo, useState } from 'react'
import { Loader, Header, FileListView, showToast, EmptyFileList } from '@components'
import { translate } from '@i18n'
import { useStores } from '@models'
import { FileModelType } from '@models/stores/models'
import { useNavigation, useRoute } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import { getDirNameFromPath, getPrevPath } from '@utils'
import { observer } from 'mobx-react-lite'
import { Animated, TouchableOpacity, Text, View } from 'react-native'

import styles from './styles'

export const MoveFilesAndFoldersScreen = observer(() => {
  const { params } = useRoute<RouteParams>()
  const navigation = useNavigation<StackNavigationProp<any>>()

  const {
    fileListStore: { initialLoading, getFileList, getFetchMetadataStatus, fetchMetadataLastEpoch, fetchDirMetadata },
    fileOpsStore: { getSelectedFiles, moveAllSelectedFiles, loadingOpMove, errorOpMove },
  } = useStores()

  const selectedFiles = getSelectedFiles()
  const _isMoveHereDisabled = (): boolean => {
    let _disabled = false
    selectedFiles.some(selectedFile => {
      console.log('selectedPath', selectedFile.path, selectedFile.name)
      // console.log('params', params.path)
      if (selectedFile.path === params.path) {
        _disabled = true
        return true
      }
      return false
    })
    return _disabled
  }

  const isMoveHereDisabled = _isMoveHereDisabled()

  const { fetchMetadataLoading, fetchMetadataError } = useMemo(() => {
    return getFetchMetadataStatus(params.path)
  }, [fetchMetadataLastEpoch])

  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [fileList, setFileList] = useState<FileModelType>([])

  const emptyFileListAnimatedValue = useMemo(() => new Animated.Value(Number(!fileList?.length)), [])
  const fileListOpacity = fileList?.length
    ? emptyFileListAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      })
    : 1

  const onRefresh = (path: string = params.path) => {
    setRefreshing(true)
    fetchDirMetadata(path)
  }

  const handlePressFile = (file: FileModelType) => {
    if (file.isDir) {
      navigation.push('SubMain', {
        path: file.path,
        fallBackPath: params.fallBackPath,
        screen: 'MoveFilesAndFolders',
        showFolderName: true,
      })
    }
  }

  const onPressMoveHere = () => {
    moveAllSelectedFiles(params.path)
    const screen = params.fallbackNavigator
    navigation.navigate('Main', {
      screen,
      params: {
        screen: 'DirectoryDetails',
        path: params.fallBackPath,
        name: getDirNameFromPath(params.fallBackPath),
      },
    })
  }

  useEffect(() => {
    const toValue = Number(!fileList.length)
    Animated.timing(emptyFileListAnimatedValue, {
      toValue,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [fileList.length])

  useEffect(() => {
    const list = getFileList(params.path, false, 'uploaded', 'desc')
    if (list.length === 0) {
      fetchDirMetadata(params.path)
    } else setFileList(list)
  }, [])

  useEffect(() => {
    if (fetchMetadataLoading) return
    if (refreshing) setRefreshing(false)
    if (!fetchMetadataError) {
      setFileList(getFileList(params.path, false, 'uploaded', 'desc'))
    }
  }, [fetchMetadataLoading, fetchMetadataError])

  useEffect(() => {
    if (errorOpMove) {
      showToast('error', translate('error:failed_to_move_the_file'))
    }
  }, [errorOpMove])

  const renderHeader = (
    <Header
      isLoading={fetchMetadataLoading && !refreshing}
      navigation={navigation}
      title={params.showFolderName ? getDirNameFromPath(params.path) : translate('options:move_to')}
      onBackCallback={() => onRefresh(getPrevPath(params.path))}
      rightView={
        <TouchableOpacity
          onPress={onPressMoveHere}
          disabled={isMoveHereDisabled}
          style={isMoveHereDisabled ? styles.disabledMoveHereTextContainer : {}}>
          <Text style={styles.moveHereText}>{translate('move_files_and_folders:move_here')}</Text>
        </TouchableOpacity>
      }
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

  return (
    <>
      {renderHeader}
      <Loader isVisible={loadingOpMove} />
      <Animated.View style={[styles.flex, { opacity: fileListOpacity }]}>
        <FileListView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          data={fileList}
          extraData={fileList}
          headerTitle={translate('home:recent_viewed_files')}
          onPressFile={handlePressFile}
          marginTop={20}
          listLayout
          isMovingFiles
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Animated.View style={{ opacity: emptyFileListAnimatedValue }}>
              <EmptyFileList />
            </Animated.View>
          }
          ListHeaderComponent={<View style={styles.headerComponent} />}
        />
      </Animated.View>
    </>
  )
})
