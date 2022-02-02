import React, { useLayoutEffect } from 'react'
import { TouchableOpacity, View, SafeAreaView, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { useNavigation, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { translate } from '@i18n'
import { useStores } from '@models'
import { cameraCapture } from '@utils'
import { SvgIcon } from '@components'
import styles from './styles'

export const CameraCaptureScreen = observer(() => {
  const { params } = useRoute<RouteParams>()
  const navigation = useNavigation()
  const {
    uploaderStore: { uploadFileList },
  } = useStores()

  const setTabBarVisible = (isVisible = true) =>
    navigation.dangerouslyGetParent().setOptions({
      tabBarVisible: isVisible,
    })

  useLayoutEffect(() => {
    setTabBarVisible(false)
    return () => setTabBarVisible()
  }, [])

  const takePicture = async (camera: RNCamera) => {
    const fileUpload = await cameraCapture(camera)
    uploadFileList([fileUpload], params?.destDir)
    navigation.goBack()
  }

  const showAlertForCameraAccess = () => {
    navigation.goBack()
    Alert.alert(
      translate('camera:required_permission_camera_title'),
      translate('camera:required_permission_camera_desc'),
    )
  }

  const renderCameraComponents = ({ camera, status }) => {
    if (status === RNCamera.Constants.CameraStatus.NOT_AUTHORIZED) return showAlertForCameraAccess()
    if (status === RNCamera.Constants.CameraStatus.PENDING_AUTHORIZATION) return <View />
    return (
      <SafeAreaView style={styles.container}>
        <SvgIcon
          name={'arrow-left'}
          size={20}
          onPress={() => navigation.goBack()}
          fill={'#fff'}
          containerStyle={styles.cancelIconContainer}
        />
        <TouchableOpacity style={styles.captureButton} onPress={() => takePicture(camera)}>
          <View style={styles.captureInnerRedSquare} />
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <RNCamera
      style={styles.preview}
      type={RNCamera.Constants.Type.back}
      flashMode={RNCamera.Constants.FlashMode.on}
      captureAudio={false}
      androidCameraPermissionOptions={{
        title: translate('camera:permission_use_camera'),
        message: 'We need your permission to use your camera',
        buttonPositive: translate('ok'),
        buttonNegative: translate('cancel'),
      }}>
      {renderCameraComponents}
    </RNCamera>
  )
})
