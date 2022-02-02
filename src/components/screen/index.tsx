import React, { FunctionComponent } from 'react'
import { ScrollView, ViewStyle, StyleSheet } from 'react-native'
import { RefreshControl } from '@components/refresh-control'
import styles from './styles'

type Props = {
  style?: ViewStyle
  paddingHorizontal?: number
  children?: React.ReactNode | React.ReactNode[]
  onRefresh?: () => void
  refreshing?: boolean
  contentInsetBottom?: number
  scrollViewStyle?: ViewStyle
  [x: string]: any
}

export const Screen: FunctionComponent<Props> = ({
  style,
  paddingHorizontal = '5%',
  children,
  onRefresh,
  refreshing,
  contentInsetBottom = 0,
  scrollViewStyle,
  ...otherProps
}) => {
  const renderRefreshControl = onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : null
  return (
    <ScrollView
      contentInset={{ bottom: contentInsetBottom }}
      style={[styles.container, scrollViewStyle]}
      contentContainerStyle={StyleSheet.flatten([styles.contentContainer, { paddingHorizontal }, style])}
      keyboardShouldPersistTaps={'never'}
      showsVerticalScrollIndicator={false}
      refreshControl={renderRefreshControl}
      {...otherProps}>
      {children}
    </ScrollView>
  )
}
