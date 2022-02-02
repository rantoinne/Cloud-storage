import { color } from '@theme'
import React, { FunctionComponent } from 'react'
import { View, ViewStyle, Switch, Platform } from 'react-native'

const switchColors = {
  tackColor: {
    enabled: color.palette.blue,
    disabled: color.palette.gray6,
  },
  thumbColor: {
    enabled: color.palette.white,
    disabled: color.palette.white,
  },
  iosBg: color.palette.gray6,
}

type Props = {
  onChangeValue?: (val: boolean) => void
  enabled?: boolean
  containerStyle?: ViewStyle
  [x: string]: any
}

const scale = Platform.OS === 'ios' ? 0.8 : 1

export const SwitchInput: FunctionComponent<Props> = ({
  onChangeValue,
  enabled = false,
  containerStyle,
  ...otherProps
}) => {
  return (
    <View style={containerStyle}>
      <Switch
        trackColor={{
          false: switchColors.tackColor.disabled,
          true: switchColors.tackColor.enabled,
        }}
        thumbColor={enabled ? switchColors.thumbColor.enabled : switchColors.thumbColor.disabled}
        ios_backgroundColor={switchColors.iosBg}
        onValueChange={() => onChangeValue(!enabled)}
        value={enabled}
        style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
        {...otherProps}
      />
    </View>
  )
}
