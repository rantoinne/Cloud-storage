import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { translate } from '@i18n'
import { useStores } from '@models'
import { Screen, Header, ManageFilesSection, ActionText, FileManageCard, TabTag } from '@components'
import { StackNavigationProp } from '@react-navigation/stack'
import styles from './styles'
import { View } from 'react-native'

export const ManageFilesScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<any>>()
  const {
    uploaderStore: {
      userSync,
      autoSync,
      uploadSuccessCount,
      uploadFailCount,
      totalCount,
      observedFile,
      retryAllFailed,
      dismissAllFailed,
      clearSuccessful,
      dismissAllNeedUpload,
      dismissInProgress,
      dismissFile,
      retryFailed,
    },
    downloaderStore: {
      userDownload,
      cancelDownload,
      removeFileFromQueue,
      dismissAllNeedDownload,
      dismissFile: dismissDownloadFile,
      retryFailed: retryFailedDownload,
      observedFile: observedDownloadingFile,
      retryAllFailed: retryAllFailedDownloads,
      clearSuccessful: clearSuccessfulDownloads,
      dismissAllFailed: dismissAllFailedDownloads,
    },
  } = useStores()

  /****************/
  /*     DATA     */
  /****************/

  /* GENERAL LISTING */
  const queueList = useMemo(() => {
    return Array.from(userSync.queue.queueMap, ([, file]) => file).concat(
      Array.from(autoSync.queue.queueMap, ([, file]) => file),
    )
  }, [totalCount, uploadFailCount])

  /* GENERAL LISTING DOWNLOADS */
  const queueDownloadList = Array.from(userDownload.queue.queueMap.values())

  /* SUCCESS LISTING */
  const successQueueList = useMemo(() => {
    return Array.from(userSync.queue.successMap, ([, file]) => file).concat(
      Array.from(autoSync.queue.successMap, ([, file]) => file),
    )
  }, [uploadSuccessCount])

  const successQueueDownloadsList = Array.from(userDownload.queue.successMap.values())

  const discardFileStatuses = ['failed', 'cancelled']

  const failedQueueListForDownloads = queueDownloadList.filter(el => discardFileStatuses.includes(el.status))

  const [activeTab, setActiveTab] = useState<'uploads' | 'downloads'>(
    (queueDownloadList.length !== 0 || successQueueDownloadsList.length !== 0) &&
      failedQueueListForDownloads.length !== queueDownloadList.length
      ? 'downloads'
      : 'uploads',
  )

  /* RENDER CURRENTLY UPLOADING */
  const renderUploading = useMemo(() => {
    if (observedFile) {
      const progress = observedFile.progress
      return (
        <FileManageCard key={observedFile.path} file={observedFile} progress={progress} onPressClose={dismissFile} />
      )
    } else return null
  }, [observedFile?.path, observedFile?.progress])

  /* RENDER CURRENTLY DOWNLOADING */
  const renderDownloading = () => {
    if (observedDownloadingFile) {
      const progress = observedDownloadingFile.progress
      return (
        <FileManageCard
          key={observedDownloadingFile.location}
          isDownload
          file={observedDownloadingFile}
          progress={progress}
          onPressClose={dismissDownloadFile}
        />
      )
    }
    return null
  }

  /* RENDER SUCCESS LISTING */
  const renderSuccessQueueList = useMemo(() => {
    return successQueueList.map(file => <FileManageCard key={file.path} file={file} onPressClose={dismissFile} />)
  }, [uploadSuccessCount])

  /* RENDER SUCCESS LISTING DOWNLOADS */
  const renderSuccessQueueDownloadsList = successQueueDownloadsList.map(file => (
    <FileManageCard key={file.location} isDownload file={file} onPressClose={dismissDownloadFile} />
  ))

  /* RENDER NEXTUP & RENDER INCOMPLETE LISTING */
  const [renderNextUpList, renderIncompleteList] = useMemo(() => {
    // hack: ideally need-upload should be enough of a state difference to not have to check file path
    // without this we have dupe files up next and uploading
    const nextUpList = queueList.filter(el => el.status === 'need-upload' && el.path !== observedFile?.path)
    const incompleteList = queueList.filter(el => el.status === 'failed' && el.path !== observedFile?.path)
    return [
      nextUpList.map(file => <FileManageCard key={file.path} file={file} onPressClose={dismissFile} />),
      incompleteList.map(file => (
        <FileManageCard key={file.path} file={file} onPressClose={dismissFile} onRetry={retryFailed} />
      )),
    ]
  }, [totalCount, uploadFailCount, observedFile])

  /* RENDER NEXTUP & RENDER INCOMPLETE LISTING  DOWNLOADS */
  const nextUpList = queueDownloadList.filter(el => el.status === 'need-download')
  const renderNextUpDownloadList = nextUpList.map(file => (
    <FileManageCard key={file.location} file={file} onPressClose={dismissDownloadFile} />
  ))
  const incompleteList = queueDownloadList.filter(el => el.status === 'failed' || el.status === 'cancelled')
  const renderIncompleteDownloadList = incompleteList.map(file => (
    <FileManageCard key={file.location} file={file} onPressClose={removeFileFromQueue} onRetry={retryFailedDownload} />
  ))

  const switchUploadAndDownloadActions = (uploadAction: () => void, downloadAction: () => void) => {
    switch (activeTab) {
      case 'uploads':
        uploadAction()
        break
      case 'downloads':
        downloadAction()
        break
      default:
        break
    }
  }

  const dismissInProgressAction = (
    <ActionText onPress={dismissInProgress}>{translate('manage_files:cancel_upload')}</ActionText>
  )

  const dismissAllNeedUploadAction = (
    <ActionText onPress={() => switchUploadAndDownloadActions(dismissAllNeedUpload, dismissAllNeedDownload)}>
      {translate('manage_files:cancel_all')}
    </ActionText>
  )
  const clearSuccessfulAction = (
    <ActionText onPress={() => switchUploadAndDownloadActions(clearSuccessful, clearSuccessfulDownloads)}>
      {translate('manage_files:dismiss_all')}
    </ActionText>
  )
  const dismissAllFailedAction = (
    <ActionText onPress={() => switchUploadAndDownloadActions(dismissAllFailed, dismissAllFailedDownloads)}>
      {translate('manage_files:dismiss_all')}
    </ActionText>
  )
  const retryAllFailedAction = (
    <ActionText onPress={() => switchUploadAndDownloadActions(retryAllFailed, retryAllFailedDownloads)}>
      {translate('manage_files:retry_all')}
    </ActionText>
  )

  const cancelCurrentDownloading = () => {
    cancelDownload()
  }

  const renderManageFilesSection = () => {
    switch (activeTab) {
      case 'uploads':
        return (
          <>
            <ManageFilesSection
              isEmpty={observedFile === undefined}
              textWhenEmpty={translate('manage_files:empty_section_uploading_inprogress')}
              rightAction={dismissInProgressAction}
              title={translate('manage_files:uploading')}>
              {renderUploading}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderNextUpList.length === 0}
              title={translate('manage_files:next_up')}
              textWhenEmpty={translate('manage_files:empty_section_uploading_nextup')}
              rightAction={dismissAllNeedUploadAction}>
              {renderNextUpList}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderSuccessQueueList.length === 0}
              title={translate('manage_files:completed')}
              textWhenEmpty={translate('manage_files:empty_section_uploading_completed')}
              rightAction={clearSuccessfulAction}>
              {renderSuccessQueueList}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderIncompleteList.length === 0}
              title={translate('manage_files:incomplete_uploads')}
              textWhenEmpty={translate('manage_files:empty_section_uploading_incomplete')}
              rightAction={dismissAllFailedAction}
              leftAction={retryAllFailedAction}>
              {renderIncompleteList}
            </ManageFilesSection>
          </>
        )
      default:
        return (
          <>
            <ManageFilesSection
              isEmpty={observedDownloadingFile === undefined}
              textWhenEmpty={translate('manage_files:empty_section_downloading_inprogress')}
              rightAction={
                <ActionText onPress={cancelCurrentDownloading}>{translate('manage_files:cancel_download')}</ActionText>
              }
              title={translate('manage_files:downloading')}>
              {renderDownloading()}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderNextUpDownloadList.length === 0}
              title={translate('manage_files:next_up')}
              textWhenEmpty={translate('manage_files:empty_section_downloading_nextup')}
              rightAction={dismissAllNeedDownload}>
              {renderNextUpDownloadList}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderSuccessQueueDownloadsList.length === 0}
              title={translate('manage_files:completed')}
              textWhenEmpty={translate('manage_files:empty_section_downloading_completed')}
              rightAction={clearSuccessfulAction}>
              {renderSuccessQueueDownloadsList}
            </ManageFilesSection>
            <ManageFilesSection
              isEmpty={renderIncompleteDownloadList.length === 0}
              title={translate('manage_files:incomplete_downloads')}
              textWhenEmpty={translate('manage_files:empty_section_downloading_incomplete')}
              rightAction={dismissAllFailedAction}
              leftAction={retryAllFailedAction}>
              {renderIncompleteDownloadList}
            </ManageFilesSection>
          </>
        )
    }
  }

  return (
    <>
      <Header navigation={navigation} title={translate('manage_files:manage_files')} />
      <Screen style={styles.container}>
        <View style={styles.tabs}>
          <TabTag
            label={translate('uploads')}
            active={activeTab === 'uploads'}
            onPress={() => setActiveTab('uploads')}
          />
          <TabTag
            label={translate('downloads')}
            active={activeTab === 'downloads'}
            onPress={() => setActiveTab('downloads')}
          />
        </View>
        {renderManageFilesSection()}
      </Screen>
    </>
  )
})
