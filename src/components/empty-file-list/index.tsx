import React, { FunctionComponent } from 'react'
import { View, Text, Image } from 'react-native'
import { translate } from '@i18n'
import { emptyBox } from '@images'
import { Button } from '../button'
import styles from './styles'

type Props = {
  title?: string
  description?: string
  onPress?: () => void
}

export const EmptyFileList: FunctionComponent<Props> = ({ title, description, onPress }) => {
  return (
    <View style={styles.noFilesContainer}>
      <Image source={emptyBox} style={styles.image} />
      <Text style={styles.noFilesText}>{description ?? translate('home:no_files')}</Text>
      {typeof onPress === 'function' && (
        <Button
          onPress={onPress}
          name={title ?? `+ ${translate('home:create_new_file')}`}
          containerStyle={styles.button}
        />
      )}
    </View>
  )
}
