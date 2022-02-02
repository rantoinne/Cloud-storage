import { translate } from '@i18n'
import { color } from '@theme'
import { formatByte } from '@utils/byte'
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { View, Text, Image, ViewStyle } from 'react-native'
import { spaceUsed } from '@images'
import styles from './styles'

const GigatoBytes = 1024 * 1024 * 1024

const trackerColors = {
  red: { slider: color.sliderRed, tracker: color.trackerLightRed },
  yellow: { slider: color.sliderYellow, tracker: color.trackerLightYellow },
  green: { slider: color.green, tracker: color.lightGreen },
}

type Props = {
  isVisible?: boolean
  usedStorage?: number
  totalStorage?: number
  onDismiss?: () => void
  containerStyle?: ViewStyle
}

export const StorageTracker: FunctionComponent<Props> = ({
  isVisible,
  usedStorage,
  totalStorage,
  onDismiss,
  containerStyle,
}) => {
  if (!isVisible) return null
  const [percentageCalc, setPercentageCalc] = useState(0)
  const [trackerColor, setTrackerColor] = useState(trackerColors.green)

  const percentageUsedStr = useCallback(() => {
    return `${formatByte(usedStorage * GigatoBytes)} of ${formatByte(totalStorage * GigatoBytes)} used`
  }, [usedStorage, totalStorage])

  const titleSpaceUsed = useCallback(() => {
    return translate(usedStorage ? 'profile:space_used' : 'profile:no_space_used')
  }, [usedStorage, totalStorage])

  useEffect(() => {
    calculatePercentageUsed()
  }, [usedStorage])

  useEffect(() => {
    setTrackerColors()
  }, [percentageCalc])

  const calculatePercentageUsed = () => {
    const percentage = (usedStorage / totalStorage) * 100
    setPercentageCalc(parseFloat(percentage.toFixed(1)))
  }

  const setTrackerColors = () => {
    let trackerColor = trackerColors.red
    if (percentageCalc < 30) {
      trackerColor = trackerColors.green
    } else if (percentageCalc < 70) {
      trackerColor = trackerColors.yellow
    }
    setTrackerColor(trackerColor)
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.storageTrackerBox}>
        <Image source={spaceUsed} style={styles.icon} />
        <View style={styles.trackerItem}>
          <Text style={styles.trackerItemTitle}>{titleSpaceUsed()}</Text>
          <View style={[styles.slider, { backgroundColor: trackerColor.tracker }]}>
            <View style={[styles.slideBar, { backgroundColor: trackerColor.slider, width: `${percentageCalc}%` }]} />
          </View>
          <Text style={styles.trackerItemSubTitle}>{percentageUsedStr()}</Text>
        </View>
        {onDismiss && (
          <View>
            <Text style={styles.dismisText} onPress={() => onDismiss()}>
              {translate('dismiss').toLocaleUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
