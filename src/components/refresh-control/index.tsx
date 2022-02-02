import React, { FunctionComponent } from 'react'
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native'
import { color } from '@theme'

export const RefreshControl: FunctionComponent<RefreshControlProps> = props => {
  return <RNRefreshControl tintColor={color.loader} {...props} />
}
