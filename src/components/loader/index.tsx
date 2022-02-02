import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import LottieView from 'lottie-react-native'
import { loader } from '@animations'
import styles from './styles'

type Props = {
  isVisible?: boolean
}

export const Loader: FunctionComponent<Props> = ({ isVisible }) => {
  return (
    isVisible && (
      <View style={styles.overlay}>
        <LottieView source={loader} autoPlay={true} style={styles.loader} />
      </View>
    )
  )
}
