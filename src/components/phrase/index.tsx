import React, { FunctionComponent } from 'react'
import { View, Text } from 'react-native'
import styles from './styles'

type Props = { name: string }

export const Phrase: FunctionComponent<Props> = ({ name }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
    </View>
  )
}
