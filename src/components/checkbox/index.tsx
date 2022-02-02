import React, { FunctionComponent, useEffect, useState } from 'react'
import { TouchableOpacity, ViewStyle, View, Text, Appearance } from 'react-native'
import { SvgIcon } from '@components/svg-icon'
import styles from './styles'

type Props = {
  defaultValue?: boolean
  disabled?: boolean
  description?: string | React.ReactNode
  onChangeValue: (val: boolean) => void
  containerStyle?: ViewStyle
  marginTop?: number
}

export const Checkbox: FunctionComponent<Props> = ({
  defaultValue = false,
  disabled,
  description,
  onChangeValue,
  containerStyle,
  marginTop,
}) => {
  const [isDisabled, setIsDisabled] = useState(disabled)
  const [checked, setChecked] = useState(defaultValue)
  const checkboxStyle = checked
    ? styles.checkmarkBoxChecked
    : Appearance.getColorScheme() === 'light'
    ? styles.checkmarkBoxUnchecked
    : styles.darkCheckmarkBoxUnchecked
  useEffect(() => {
    setIsDisabled(disabled)
  }, [disabled])

  const handlePressed = () => {
    setChecked(!checked)
    onChangeValue(!checked)
  }

  return (
    <TouchableOpacity
      style={[styles.container, { marginTop }, containerStyle]}
      disabled={isDisabled}
      onPress={handlePressed}>
      <View style={checkboxStyle}>{checked && <SvgIcon size={9} name={'checkmark'} />}</View>
      <Text style={styles.text}>{description}</Text>
    </TouchableOpacity>
  )
}
