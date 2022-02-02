import { color } from '@theme'
import React, { FC, useState, useEffect, useMemo } from 'react'
import { ActivityIndicator, Animated, ImageStyle, View } from 'react-native'
import styles from './styles'

type ProgressiveImageProps = {
  style: ImageStyle
  fetchSource: () => any
  animationDuration?: number
  thumbnailIcon: React.ReactElement
}

export const ProgressiveImage: FC<ProgressiveImageProps> = ({
  style,
  fetchSource,
  thumbnailIcon,
  animationDuration = 800,
}) => {
  const [source, setSource] = useState<string>('')
  const [showErrorIcon, setErrorIcon] = useState<boolean>(false)
  const imageAnimated = useMemo(() => new Animated.Value(0), [fetchSource])

  const onImageLoad = () => {
    Animated.timing(imageAnimated, {
      toValue: 1,
      useNativeDriver: true,
      duration: animationDuration,
    }).start()
  }

  const fetchImageSource = async () => {
    let imageSource: any = ''
    if (fetchSource) imageSource = await fetchSource()
    if (imageSource.s3_thumbnail_url) setSource(imageSource.s3_thumbnail_url)
    else setErrorIcon(true)
    setTimeout(() => onImageLoad(), 100)
  }

  useEffect(() => {
    imageAnimated.setValue(0)
    fetchImageSource()
  }, [fetchImageSource])

  const onError = () => setErrorIcon(true)

  const getProgressiveImage = useMemo(() => {
    if (showErrorIcon) return thumbnailIcon
    if (source !== '')
      return <Animated.Image onError={onError} source={{ uri: source }} style={[{ opacity: imageAnimated }, style]} />
    return <ActivityIndicator color={color.palette.aliceBlue} />
  }, [source, showErrorIcon])

  return (
    <View style={styles.container}>
      {!fetchSource && thumbnailIcon}
      {getProgressiveImage}
    </View>
  )
}
