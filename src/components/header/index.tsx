import React, { FunctionComponent, useEffect, useRef } from 'react'
import { View, Text, ViewStyle, TouchableOpacity, useWindowDimensions } from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import { Logo } from '../logo'
import { color } from '@theme'
import { SvgIcon } from '../svg-icon'
import styles from './styles'
import { loader } from '@animations'
import AnimatedLottieView from 'lottie-react-native'

type Props = {
  title?: string
  navigation: NavigationProp<any>
  isTransparent?: boolean
  onBackCallback?: () => void
  isLoading?: boolean
  icons?: { name: string; onPress?: () => void; style?: ViewStyle }[]
  rightView?: React.ReactElement
  overRideNavigationGoBack?: () => void
}

export const Header: FunctionComponent<Props> = ({
  title,
  navigation,
  isTransparent = false,
  onBackCallback,
  isLoading = false,
  icons = [],
  rightView,
  overRideNavigationGoBack,
}) => {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height
  const loaderStyleSize = { height: 100 }
  const lottieAnimatorRef = useRef<AnimatedLottieView>()

  useEffect(() => {
    if (isLoading) {
      lottieAnimatorRef.current?.play()
    } else lottieAnimatorRef.current?.reset()
  }, [isLoading])

  const renderBackTitle = () => {
    return (
      <TouchableOpacity
        style={styles.leftSection}
        onPress={() => {
          if (overRideNavigationGoBack) {
            overRideNavigationGoBack()
          } else {
            navigation.goBack()
          }
          setTimeout(() => {
            onBackCallback?.()
          })
        }}>
        <SvgIcon containerStyle={styles.backIcon} name={'arrow-left'} fill={color.palette.black} size={14} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderRightIcons = () => {
    return (
      <View style={styles.rightSection}>
        {icons.map(({ name, onPress, style }) => (
          <SvgIcon
            key={name}
            onPress={onPress}
            name={name}
            size={14}
            fill={color.palette.black}
            containerStyle={[styles.icon, style]}
          />
        ))}
      </View>
    )
  }

  return (
    <View
      style={[
        styles.container,
        isTransparent && styles.containerTransparent,
        isLandscape && styles.containerLandscape,
      ]}>
      {title || isTransparent ? renderBackTitle() : <Logo size={25} />}
      {icons?.length > 0 && renderRightIcons()}
      {rightView && rightView}
      <View style={styles.loaderContainer}>
        {isLoading && (
          <AnimatedLottieView
            ref={lottieAnimatorRef}
            source={loader}
            autoPlay={true}
            style={loaderStyleSize}
            autoSize={false}
            resizeMode={'contain'}
          />
        )}
      </View>
    </View>
  )
}
