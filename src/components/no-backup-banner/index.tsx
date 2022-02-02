import React, { FunctionComponent } from 'react'
import { View, Text, Image } from 'react-native'
import { translate } from '@i18n'
import { swoosh } from '@images'
import { ButtonSmall } from '../button'

import styles from './styles'

type Props = {
  isVisible?: boolean
  onPressBackup?: () => void
  onPressRemindMeLater?: () => void
  marginTop?: number
}

export const NoBackupBanner: FunctionComponent<Props> = ({
  isVisible,
  onPressBackup,
  onPressRemindMeLater,
  marginTop = 0,
}) => {
  if (!isVisible) return null
  return (
    <View style={[styles.noBackUpContainer, { marginTop }]}>
      <Image source={swoosh} style={styles.swoosh} />
      <View style={styles.leftSide}>
        <Text style={styles.noBackUpTitle}>{translate('home:account_not_back_up')}</Text>
        <Text style={styles.noBackUpSubtitle}>{translate('home:risk_no_back_up')}</Text>
      </View>
      <View style={styles.rightSide}>
        <ButtonSmall name={translate('home:backup')} onPress={onPressBackup} />
        <Text style={styles.linkWhite} onPress={onPressRemindMeLater}>
          {translate('home:remind_me_later')}
        </Text>
      </View>
    </View>
  )
}
