import React, { FunctionComponent } from 'react'
import { StatusBar as RNStatusBar, StatusBarProps } from 'react-native'
import { color } from '@theme'

export const StatusBar: FunctionComponent<StatusBarProps> = props => {
  return <RNStatusBar backgroundColor={color.background} barStyle={'dark-content'} {...props} />
}
