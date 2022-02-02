import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity, StatusBar, View, Text } from 'react-native'
import FileScanner, { FileSync, ScanStatus } from 'rn-file-scanner'
import { AutoSyncController } from './auto-sync'
import styles, { statusBarBgColor } from './styles'

const App = () => {
  // data
  const [data, setData] = useState<FileSync[]>([])
  // pagination
  const [lastGlobalIndex, setLastGlobalIndex] = useState(0)
  // refresh and append
  const [refreshing, setRefreshing] = useState(false)
  const [appending, setAppending] = useState(false)
  const [scanStatus, setScanStatus] = useState<ScanStatus>()

  useEffect(() => {
    const unsubscribe = FileScanner.onScanStatus(setScanStatus)
    AutoSyncController.setConfig({
      accountHandle: '',
      includePhotos: true,
      includeVideos: true,
      syncPhotosFromDate: null,
      hasStorageAccess: true,
    }).then(() => {
      data.length === 0 && refreshData()
    })
    return unsubscribe
  }, [])

  const refreshData = async () => {
    try {
      setRefreshing(true)
      const res = await AutoSyncController.getNextToSyncPage(1)
      setLastGlobalIndex(res.lastGlobalIndex)
      setData(res.list)
    } finally {
      setRefreshing(false)
    }
  }

  const appendData = async () => {
    try {
      setAppending(true)
      const res = await AutoSyncController.getNextToSyncPage(lastGlobalIndex)
      if (res.lastGlobalIndex > lastGlobalIndex) {
        setLastGlobalIndex(res.lastGlobalIndex)
        setData(data.concat(res.list))
      }
    } finally {
      setAppending(false)
    }
  }

  useEffect(() => {
    if (scanStatus === 'FINISHED' || scanStatus === 'NO_SCAN') {
      data.length === 0 && refreshData()
    }
  }, [scanStatus])

  const setFileSynced = (path: string) => {
    AutoSyncController.updateFileStatusToSynced(path, 'synced')
  }

  const renderHeader = () => {
    return <Text style={styles.scanStatusHeaderText}>{`Scan Status: ${scanStatus}`}</Text>
  }

  const renderFooter = () => {
    return appending ? <ActivityIndicator style={styles.footer} color={'red'} /> : null
  }

  const renderItem = ({ item }: { item: FileSync }) => {
    const { type, path, size } = item as FileSync
    const name = path.split('/').pop()
    return (
      <TouchableOpacity style={styles.item} onPress={() => setFileSynced(item.path)}>
        <View style={styles.leftSide}>
          <Text style={styles.itemLabel}>{name}</Text>
          <Text style={styles.itemSublabel}>Size: {size}</Text>
          <Text style={styles.itemSublabel}>Type: {type}</Text>
          {/* <Text style={styles.itemSublabel}>Status: {status}</Text> */}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor={statusBarBgColor} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.listContentContainer}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        onRefresh={refreshData}
        refreshing={refreshing}
        onEndReached={appendData}
        data={data}
        extraData={data}
        contentInsetAdjustmentBehavior='automatic'
        keyExtractor={item => item.path}
      />
    </>
  )
}

export default App
