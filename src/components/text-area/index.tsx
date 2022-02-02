import { color } from '@theme'
import React, { FunctionComponent, useState } from 'react'
import { View, TextInput, ViewStyle, Text } from 'react-native'
import styles from './styles'

type Props = {
  title?: string
  onChangeValue?: (val: string) => void
  containerStyle?: ViewStyle
  marginTop?: number
  [x: string]: any
}

export const TextArea: FunctionComponent<Props> = ({
  title,
  onChangeValue,
  containerStyle,
  marginTop = 0,
  ...otherProps
}) => {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.container, { marginTop }, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline
        autoCorrect={false}
        autoCapitalize={'none'}
        placeholderTextColor={color.palette.grayMid}
        style={[styles.textInput, focused && styles.textInputFocused]}
        onChangeText={onChangeValue}
        {...otherProps}
      />
    </View>
  )
}
