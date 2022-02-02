import React, { FunctionComponent } from 'react'
import { TouchableOpacity, ViewStyle, StyleSheet, View } from 'react-native'
import { camelCase } from 'lodash'
import * as config from '../../../assets/svg'
import { toUpperCaseFirstLetter } from '@utils'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

type Props = {
  onPress?: () => void
  name: string
  size?: number
  height?: number
  width?: number
  disabled?: boolean
  containerStyle?: ViewStyle | ViewStyle[]
  [x: string]: any
}

export const SvgIcon: FunctionComponent<Props> = ({
  onPress,
  name,
  size,
  containerStyle,
  height,
  width,
  disabled = false,
  ...otherProps
}) => {
  const pascalCaseName = name?.length ? toUpperCaseFirstLetter(camelCase(name)) : 'Warning'
  const iconClass = config[pascalCaseName] || config.Warning

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]} disabled={disabled}>
        {React.createElement(iconClass, {
          backgroundColor: 'transparent',
          height: height || size,
          width: width || size,
          ...otherProps,
        })}
      </TouchableOpacity>
    )
  } else {
    return (
      <View style={[styles.container, containerStyle]}>
        {React.createElement(iconClass, {
          backgroundColor: 'transparent',
          height: height || size,
          width: width || size,
          ...otherProps,
        })}
      </View>
    )
  }
}
