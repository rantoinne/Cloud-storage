import React, { FunctionComponent, useEffect, useState, useRef } from 'react'
import { View, Text, TextInput, Platform } from 'react-native'
import Modal from 'react-native-modal'
import { translate, TxKeyPath } from '@i18n'
import { Button } from '@components'
import styles from './styles'

export type Props = {
  isVisible: boolean
  name?: string
  title: string
  buttonTitle?: TxKeyPath
  onDismiss: () => void
  onPress: (value: string) => void
}

export const EnterNameModal: FunctionComponent<Props> = ({
  isVisible,
  name = '',
  title,
  buttonTitle,
  onDismiss,
  onPress,
  ...otherProps
}) => {
  const [value, setValue] = useState<string>(null)
  const inputRef = useRef<TextInput>()

  useEffect(() => {
    if (!isVisible) {
      inputRef.current?.clear()
      setValue(null)
    } else {
      if (Platform.OS === 'android') {
        setValue(name)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (value) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [value])

  const renderTextInput = () => {
    return (
      <TextInput
        autoFocus
        ref={inputRef}
        autoCorrect={false}
        autoCapitalize={'none'}
        style={styles.textInput}
        underlineColorAndroid='transparent'
        value={value ?? name}
        onChangeText={setValue}
        {...otherProps}
      />
    )
  }

  const handlePressCreate = () => {
    onDismiss()
    onPress(value)
  }

  return (
    <Modal style={styles.modal} isVisible={isVisible} onBackdropPress={onDismiss}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.midSection}>{renderTextInput()}</View>
        <View style={styles.botttomSection}>
          <Text style={styles.textButton} onPress={onDismiss}>
            {translate('cancel')}
          </Text>
          <Button
            containerStyle={styles.button}
            name={translate(buttonTitle) ?? translate('create')}
            onPress={handlePressCreate}
            disabled={!value || value === name}
          />
        </View>
      </View>
    </Modal>
  )
}
