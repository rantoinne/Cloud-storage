import React, { FunctionComponent, useMemo } from 'react'
import { View, Image, ViewStyle } from 'react-native'
import { logoBlueText } from '@images'
import styles from './styles'

type Props = {
  containerStyle?: ViewStyle | ViewStyle[]
  size?: number
}

const LOGO_WIDTH_HEIGHT_RATIO = 136 / 31

export const Logo: FunctionComponent<Props> = ({ size = 31, containerStyle }) => {
  const { width, height } = useMemo(() => {
    return { width: size * LOGO_WIDTH_HEIGHT_RATIO, height: size }
  }, [size])

  return (
    <View style={[styles.logoContainer, containerStyle]}>
      <Image source={logoBlueText} resizeMode={'contain'} style={{ width, height }} />
    </View>
  )
}
