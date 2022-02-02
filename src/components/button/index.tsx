import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import {
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
  Text,
  TouchableOpacityProps,
  TextStyle,
  View,
  TouchableHighlight,
} from 'react-native'
import { color } from '@theme'
import { pSBC } from '@utils'
import { SvgIcon } from '@components/svg-icon'
import styles from './styles'

const DARK_FACTOR = -0.75
const activeOpacity = 0.7

interface Props extends TouchableOpacityProps {
  name: string
  loading?: boolean
  disabled?: boolean
  onPress: () => void
  icon?: { name: string; size?: number }
  bgColor?: string
  _borderColor?: string
  containerStyle?: ViewStyle | ViewStyle[]
  nameStyle?: TextStyle
  marginTop?: number
  [x: string]: any
}

export const Button: FunctionComponent<Props> = ({
  name,
  loading = false,
  disabled = false,
  onPress,
  icon,
  bgColor = color.primary,
  _borderColor,
  containerStyle,
  nameStyle,
  marginTop = 0,
  ...otherProps
}) => {
  const [isDisabled, setIsDisabled] = useState(disabled)
  const {
    backgroundColor,
    underlayColor,
    borderColor,
    borderWidth,
    activityIndicatorColor,
    textColor,
  } = useMemo(() => {
    const isWhite = bgColor === color.palette.white
    return {
      backgroundColor: bgColor,
      underlayColor: isWhite ? color.palette.white : pSBC(DARK_FACTOR, bgColor),
      borderColor: _borderColor,
      borderWidth: _borderColor ? 1 : 0,
      activityIndicatorColor: isWhite ? color.primary : color.palette.white,
      textColor: isWhite ? color.primary : color.palette.white,
    }
  }, [bgColor])

  const opacity = disabled ? 0.5 : 1

  useEffect(() => {
    setIsDisabled(disabled)
  }, [disabled])

  const handlePressed = () => !loading && onPress()

  return (
    <TouchableHighlight
      activeOpacity={activeOpacity}
      underlayColor={underlayColor}
      disabled={isDisabled}
      onPress={handlePressed}
      style={[styles.container, { backgroundColor, borderColor, borderWidth, marginTop, opacity }, containerStyle]}
      {...otherProps}>
      {loading ? (
        <ActivityIndicator size='small' color={activityIndicatorColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <SvgIcon name={icon.name} size={icon.size ?? 18} containerStyle={styles.icon} />}
          <Text style={[styles.text, { color: textColor }, nameStyle]}>{name}</Text>
        </View>
      )}
    </TouchableHighlight>
  )
}

export const ButtonWhiteBlueBorder = (props: Props) => (
  <Button {...props} bgColor={color.palette.white} _borderColor={color.palette.blue} />
)

export const ButtonBlue = props => <Button {...props} bgColor={color.palette.blue} />

export const ButtonRed = props => <Button {...props} bgColor={color.palette.red} />

export const ButtonSmall = ({ name, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.containerSmall}>
    <Text style={styles.textSmall}>{name}</Text>
  </TouchableOpacity>
)

export const ButtonCircle = ({ icon, containerStyle, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.containerCircle, containerStyle]}>
      <SvgIcon name={icon.name} size={icon.size ?? 15} />
    </TouchableOpacity>
  )
}
