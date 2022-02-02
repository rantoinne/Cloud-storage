import React, { useState } from 'react'
import { View, Image, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from 'react-native'
import { observer } from 'mobx-react-lite'
import Swiper from 'react-native-swiper'
import { Screen, Text, LinkButton, Logo, StatusBar } from '@components'
import { translate } from '@i18n'
import { useNavigation } from '@react-navigation/native'
import { onboardingStep1, onboardingStep2, onboardingStep3 } from '@images'
import { color } from '@theme'
import styles from './styles'

const carouselData = [
  {
    image: onboardingStep1,
    title: translate('carousel:carousel_title_1'),
    description: translate('carousel:carousel_description_1'),
  },
  {
    image: onboardingStep2,
    title: translate('carousel:carousel_title_2'),
    description: translate('carousel:carousel_description_2'),
  },
  {
    image: onboardingStep3,
    title: translate('carousel:carousel_title_3'),
    description: translate('carousel:carousel_description_3'),
  },
]

export const CarouselScreen = observer(() => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigation = useNavigation()
  const { width, height } = useWindowDimensions()

  const linkText = currentIndex !== 2 ? translate('carousel:skip') : translate('carousel:lets_go')

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    if (
      currentIndex === carouselData.length - 1 &&
      Math.round(contentOffset.x) >= Math.round((carouselData.length - 1) * width)
    ) {
      navigation.navigate('GetStarted')
    }
  }

  const updateCurrentPageIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      nativeEvent: {
        contentOffset: { x },
      },
    } = event
    setCurrentIndex(Math.ceil(x / width))
  }

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          {translate('carousel:step_of', { current_index: currentIndex + 1, max_index: carouselData.length })}
        </Text>
        <View style={styles.pageIndicatorIconContainer}>
          {carouselData.map((_, pageIndex) => (
            <View
              key={`${pageIndex}`}
              style={pageIndex === currentIndex ? styles.activePageIndicatorIcon : styles.pageIndicatorIcon}
            />
          ))}
        </View>
      </View>
    )
  }

  const renderTextStepDescription = item => (
    <>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </>
  )

  const renderSlider = () => {
    const sliderItem = item => (
      <View style={styles.floatingContainer}>
        <Image style={styles.carouselImage} source={item.image} resizeMode='contain' />
        <View style={styles.innerFloatingContainer}>
          {renderPageIndicator()}
          {renderTextStepDescription(item)}
        </View>
      </View>
    )

    return (
      <Swiper
        bounces
        loop={false}
        index={currentIndex}
        height={height / 1.2}
        showsPagination={false}
        onMomentumScrollBegin={onScrollEndDrag}
        onMomentumScrollEnd={updateCurrentPageIndex}>
        {carouselData.map(item => sliderItem(item))}
      </Swiper>
    )
  }

  return (
    <>
      <StatusBar backgroundColor={color.palette.ghostWhite} />
      <Screen
        style={styles.container}
        scrollViewStyle={{ backgroundColor: color.palette.ghostWhite }}
        paddingHorizontal={0}>
        <View style={styles.headerContainer}>
          <LinkButton
            title={linkText}
            onPress={() => navigation.navigate('GetStarted')}
            containerStyle={styles.skipButtonContainer}
          />
          <Logo containerStyle={styles.logoContainer} />
        </View>
        {renderSlider()}
      </Screen>
    </>
  )
})
