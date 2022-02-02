import { color } from '@theme'
import React, { FunctionComponent } from 'react'
import { View, TextInput as TextInputRN, ViewStyle, Text, TextInputProps } from 'react-native'
import styles, { inputHeightWithError, inputHeight } from './styles'

interface Props extends TextInputProps {
  onChangeValue?: (val: string) => void
  containerStyle?: ViewStyle
  marginTop?: number
  error?: string
  [x: string]: any
}

export const TextInput: FunctionComponent<Props> = ({
  onChangeValue,
  containerStyle,
  marginTop = 0,
  error,
  ...otherProps
}) => {
  return (
    <View style={[styles.container, { marginTop, height: error ? inputHeightWithError : inputHeight }, containerStyle]}>
      <TextInputRN
        autoCorrect={false}
        autoCapitalize={'none'}
        style={styles.textInput}
        underlineColorAndroid='transparent'
        onChangeText={onChangeValue}
        placeholderTextColor={color.textLightGray}
        {...otherProps}
      />
      {error && (
        <Text style={styles.textError} numberOfLines={2}>
          {error}
        </Text>
      )}
    </View>
  )
}
