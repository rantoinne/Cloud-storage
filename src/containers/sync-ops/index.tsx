import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'
import {
  ActionText,
  BadgeBackedUp,
  BadgeAutoSync,
  BadgeFailUpload,
  BadgeNeedPermission,
  BadgeProgressUpload,
  BadgeProgressDownload,
  BadgeDownloadSuccessful,
} from '@components'
import { translate } from '@i18n'
import { useStores } from '@models'
import { usePrevious } from '@hooks'
import styles, { marginTop } from './styles'
import { openSettings } from 'react-native-permissions'
import { View, ViewStyle, Text, LayoutAnimation, Animated } from 'react-native'

export const SyncOps = observer<{
  containerStyle?: ViewStyle
  fetchDirMetadata?: () => void
  onPressManage?: () => void
}>(({ containerStyle, fetchDirMetadata, onPressManage }) => {
  const {
    uploaderStore: {
      setDismissAllBackedUp,
      dismissAllFailed,
      isAllBackedUp,
      currentlyUploadingCount,
      uploadSuccessCount,
      uploadFailCount,
      retryAllFailed,
    },
    downloaderStore: {
      downloadFailCount,
      downloadSuccessCount,
      currentlyDownloadingCount,
      isAllBackedUp: isAllBackedUpDownloads,
      retryAllFailed: retryAllFailedDownloads,
      dismissAllFailed: setDismissAllFailedDownloads,
      setDismissAllBackedUp: setDismissAllBackedUpDownload,
    },
    generalStore: { hasStorageAccess, autoBackUpTurnedOn, scanStatus },
  } = useStores()

  const prevCurrentlyUploadingCount = usePrevious<number>(currentlyUploadingCount)

  const autoSyncVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const needPermissionVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const backedUpVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const failUploadVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const progressUploadOpacity = useMemo(() => new Animated.Value(0), [])
  const progressDownloadOpacity = useMemo(() => new Animated.Value(0), [])
  const syncOpVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const downloadedVisibleOpacity = useMemo(() => new Animated.Value(0), [])
  const failDownloadVisibleOpacity = useMemo(() => new Animated.Value(0), [])

  const needPermissionVisible = !hasStorageAccess && autoBackUpTurnedOn
  const backedUpVisible = isAllBackedUp && uploadSuccessCount > 0
  const failUploadVisible = uploadFailCount !== 0
  const autoSyncVisible = scanStatus === 'RUNNING'
  const progressUpload = currentlyUploadingCount > 0
  const progressDownload = currentlyDownloadingCount !== 0
  const downloadSuccessfulVisible = isAllBackedUpDownloads && downloadSuccessCount > 0
  const failDownloadVisible = downloadFailCount > 0

  const syncOpVisible =
    needPermissionVisible ||
    backedUpVisible ||
    failUploadVisible ||
    autoSyncVisible ||
    progressUpload ||
    progressDownload ||
    failDownloadVisible ||
    downloadSuccessfulVisible
  const renderHeader = useMemo(
    () =>
      syncOpVisible && (
        <Animated.View style={[styles.headerContainer, { opacity: syncOpVisibleOpacity }]}>
          <Text style={styles.headerTitle}>{translate('sync_ops:file_management')}</Text>
          <ActionText style={styles.manageFilesText} onPress={onPressManage}>
            {translate('sync_ops:manage_files')}
          </ActionText>
        </Animated.View>
      ),
    [syncOpVisible, syncOpVisibleOpacity],
  )

  const handleLayoutAnimator = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

  function onPressBadgeBackedUpClose() {
    handleLayoutAnimator()
    setDismissAllBackedUp(true, true)
  }

  function onPressBadgeDownloadedSuccessfulClose() {
    handleLayoutAnimator()
    setDismissAllBackedUpDownload(true, true)
  }

  function retryAllFailedHandler() {
    handleLayoutAnimator()
    retryAllFailed()
  }

  function retryAllFailedDownloadHandler() {
    handleLayoutAnimator()
    retryAllFailedDownloads()
  }

  function dismissAllFailedHandler() {
    handleLayoutAnimator()
    dismissAllFailed()
  }

  function dismissAllFailedDownloadsHandler() {
    handleLayoutAnimator()
    setDismissAllFailedDownloads()
  }

  function openSettingsHandler() {
    handleLayoutAnimator()
    openSettings()
  }

  function animationHandler(animatedValue: Animated.Value, animationController: boolean) {
    if (animationController) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } else {
      animatedValue.setValue(0)
    }
  }

  useEffect(() => {
    animationHandler(backedUpVisibleOpacity, backedUpVisible)
  }, [backedUpVisible])

  useEffect(() => {
    if (prevCurrentlyUploadingCount > currentlyUploadingCount) {
      fetchDirMetadata()
    }
  }, [prevCurrentlyUploadingCount, currentlyUploadingCount])

  useEffect(() => {
    animationHandler(progressUploadOpacity, progressUpload)
  }, [progressUpload])

  useEffect(() => {
    animationHandler(progressDownloadOpacity, progressDownload)
  }, [progressDownload])

  useEffect(() => {
    animationHandler(failUploadVisibleOpacity, failUploadVisible)
  }, [failUploadVisible])

  useEffect(() => {
    animationHandler(failDownloadVisibleOpacity, failDownloadVisible)
  }, [failDownloadVisible])

  useEffect(() => {
    animationHandler(needPermissionVisibleOpacity, needPermissionVisible)
  }, [needPermissionVisible])

  useEffect(() => {
    animationHandler(autoSyncVisibleOpacity, autoSyncVisible)
  }, [autoSyncVisible])

  useEffect(() => {
    animationHandler(syncOpVisibleOpacity, syncOpVisible)
  }, [syncOpVisible])

  useEffect(() => {
    animationHandler(downloadedVisibleOpacity, downloadSuccessfulVisible)
  }, [downloadSuccessfulVisible])

  return (
    <View style={containerStyle}>
      {renderHeader}
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: autoSyncVisibleOpacity }}>
        <BadgeAutoSync isVisible={autoSyncVisible} marginTop={marginTop} />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: needPermissionVisibleOpacity }}>
        <BadgeNeedPermission
          isVisible={needPermissionVisible}
          onPressLink={openSettingsHandler}
          marginTop={marginTop}
        />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: backedUpVisibleOpacity }}>
        <BadgeBackedUp
          isVisible={backedUpVisible}
          count={uploadSuccessCount}
          onPressClose={onPressBadgeBackedUpClose}
          marginTop={marginTop}
        />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: failUploadVisibleOpacity }}>
        <BadgeFailUpload
          isVisible={failUploadVisible}
          onPressClose={dismissAllFailedHandler}
          onPressLink={retryAllFailedHandler}
          count={uploadFailCount}
          marginTop={marginTop}
        />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: progressUploadOpacity }}>
        <BadgeProgressUpload isVisible={progressUpload} count={currentlyUploadingCount} marginTop={marginTop} />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: progressDownloadOpacity }}>
        <BadgeProgressDownload isVisible={progressDownload} count={currentlyDownloadingCount} marginTop={marginTop} />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: downloadedVisibleOpacity }}>
        <BadgeDownloadSuccessful
          marginTop={marginTop}
          count={downloadSuccessCount}
          isVisible={downloadSuccessfulVisible}
          onPressClose={onPressBadgeDownloadedSuccessfulClose}
        />
      </Animated.View>
      <Animated.View needsOffscreenAlphaCompositing style={{ opacity: failDownloadVisibleOpacity }}>
        <BadgeFailUpload
          isVisible={failDownloadVisible}
          onPressClose={dismissAllFailedDownloadsHandler}
          onPressLink={retryAllFailedDownloadHandler}
          count={downloadFailCount}
          marginTop={marginTop}
        />
      </Animated.View>
    </View>
  )
})
