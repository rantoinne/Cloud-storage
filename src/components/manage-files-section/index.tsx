import React, { FunctionComponent, useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SvgIcon } from '@components/svg-icon'
import styles from './styles'

declare type Props = {
  title: string
  isEmpty?: boolean
  children?: React.ReactNode | React.ReactNode[]
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  textWhenEmpty?: string
}

export const ManageFilesSection: FunctionComponent<Props> = ({
  title,
  isEmpty = 0,
  children,
  leftAction = <View />,
  rightAction,
  textWhenEmpty,
}) => {
  const [isExpanded, setExpanded] = useState(!isEmpty)

  useEffect(() => {
    if (!isExpanded && !isEmpty) {
      setExpanded(true)
    }
    if (isExpanded && isEmpty) {
      setExpanded(false)
    }
  }, [isEmpty])

  return (
    <>
      <TouchableOpacity style={styles.topContainer} onPress={() => setExpanded(!isExpanded)}>
        <Text style={styles.title}>{title}</Text>
        <SvgIcon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={12}
          containerStyle={styles.chevronIconContainer}
        />
      </TouchableOpacity>
      {isExpanded && (
        <>
          {!isEmpty && (
            <View style={styles.actionsContainer}>
              {leftAction}
              {rightAction}
            </View>
          )}
          {isEmpty ? <Text style={styles.emptyViewText}>{textWhenEmpty}</Text> : children}
        </>
      )}
    </>
  )
}
