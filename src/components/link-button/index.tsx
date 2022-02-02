import React, { FunctionComponent, useEffect, useState } from 'react'
import { TouchableOpacity, Text, TextStyle, ViewStyle } from 'react-native'
import styles from './style'

type Props = {
  title: string
  disabled?: boolean
  onPress: () => void
  titleStyle?: TextStyle
  containerStyle?: ViewStyle | ViewStyle[]
  [x: string]: any
}

export const LinkButton: FunctionComponent<Props> = ({
  title,
  onPress,
  disabled = false,
  titleStyle,
  containerStyle,
  ...otherProps
}) => {
  const [isDisabled, setIsDisabled] = useState(disabled)
  useEffect(() => {
    setIsDisabled(disabled)
  }, [disabled])

  return (
    <TouchableOpacity disabled={isDisabled} onPress={onPress} style={containerStyle} {...otherProps}>
      <Text style={{ ...styles.text, ...titleStyle }}>{title}</Text>
    </TouchableOpacity>
  )
}
