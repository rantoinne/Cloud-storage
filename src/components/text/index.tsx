import React, { FunctionComponent } from 'react'
import { Text as TextRN, TextProps } from 'react-native'
import StyledText from 'react-native-styled-text'
import styles from './styles'

export const Text: FunctionComponent<TextProps> = ({ children, style, ...otherProps }) => {
  if (typeof children === 'string') {
    return (
      <StyledText style={style} textStyles={styles} {...otherProps}>
        {children}
      </StyledText>
    )
  } else {
    return (
      <TextRN style={style} {...otherProps}>
        {children}
      </TextRN>
    )
  }
}

export const ActionText: FunctionComponent<TextProps> = ({ children, style, ...otherProps }) => (
  <TextRN style={[styles.actionText, style]} {...otherProps}>
    {children}
  </TextRN>
)
