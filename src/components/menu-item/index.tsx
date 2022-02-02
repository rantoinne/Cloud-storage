import React, { FunctionComponent } from 'react'
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, ViewStyle } from 'react-native'
import { SvgIcon } from '@components/svg-icon'
import { color } from '@theme'
import styles from './styles'

type Props = {
  title: string
  subtitle?: string
  textColor?: string
  leftIcon?: ImageSourcePropType
  rightElement?: React.ReactNode
  topBorder?: boolean
  marginTop?: number
  onPress?: () => void
}

export const MenuItem: FunctionComponent<Props> = ({
  title,
  subtitle,
  textColor = color.textBlack,
  leftIcon,
  rightElement,
  topBorder,
  marginTop,
  onPress,
}) => {
  const activeOpacity = onPress ? 0.5 : 1
  return (
    <TouchableOpacity
      style={[styles.container, topBorder && styles.topBorder, { marginTop }]}
      onPress={onPress}
      activeOpacity={activeOpacity}>
      <View style={styles.leftContainer}>
        {leftIcon && <Image source={leftIcon} style={styles.leftImage} />}
        <View>
          <Text style={[styles.title, { color: textColor }, topBorder && styles.font14]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  )
}

export const MenuItemRightChevron: FunctionComponent<{
  label?: string
  containerStyle?: ViewStyle
  turnedOn?: boolean
}> = ({ label, containerStyle, turnedOn = false }) => {
  return (
    <View style={[styles.rightChevronContainer, containerStyle]}>
      {label && <Text style={[styles.rightChevronLabel, turnedOn && styles.turnedOnText]}>{label}</Text>}
      <SvgIcon name={'arrow-right'} size={12} />
    </View>
  )
}
