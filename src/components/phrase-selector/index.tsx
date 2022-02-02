import React, { FunctionComponent, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import styles from './styles'

type Props = {
  title: string
  phrases: string[]
  correctPhrase: string
  marginTop: number
  onItemSelect(isCorrect: boolean): void
}

export const PhraseSelector: FunctionComponent<Props> = ({
  title,
  phrases,
  marginTop,
  correctPhrase,
  onItemSelect,
}) => {
  const [active, setActive] = useState<number>()
  const lastIndex = phrases.length - 1

  const cellStyle = index => {
    return StyleSheet.flatten([
      styles.phraseCell,
      index === 0 && styles.phraseCellFirst,
      index === lastIndex && styles.phraseCellLast,
      active === index && styles.phraseCellActive,
      active === index + 1 && styles.noBorderRight,
    ])
  }

  const onSelect = (index: number) => {
    setActive(index)
    onItemSelect(correctPhrase === phrases[index])
  }

  return (
    <View style={[styles.container, { marginTop }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.phrasesRow}>
        {phrases.map((phrase, index) => (
          <TouchableOpacity key={`${phrase}-${index}`} onPress={() => onSelect(index)} style={cellStyle(index)}>
            <Text style={[styles.phraseText, active === index && styles.phraseTextActive]}>{phrase}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
