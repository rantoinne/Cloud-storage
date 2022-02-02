import React, { FunctionComponent } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import styles from './styles'

declare type Props = {
  label: string
  active?: boolean
  onPress?: () => void
}

export const TabTag: FunctionComponent<Props> = ({ label, onPress, active }) => (
  <TouchableOpacity style={[styles.container, active && styles.containerActive]} onPress={onPress}>
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </TouchableOpacity>
)
