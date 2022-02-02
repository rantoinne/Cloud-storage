import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { Screen, Header, MenuItem, MenuItemRightChevron, SvgIcon, showToast } from '@components'
import { translate } from '@i18n'
import { termsAndCondition, privacyPolicy, appVersion, environment, accountHandle, about } from '@images'
import { version, build } from '../../../package.json'
import { USER_FACING_ENV } from '@env'
import styles from './styles'
import { capitalizeFirstLetter } from '@utils/string'
import { useStores } from '@models'
import Clipboard from '@react-native-community/clipboard'

export const AboutScreen = observer(() => {
  const {
    authStore: { handle },
  } = useStores()

  const handlePressCopy = () => {
    Clipboard.setString(handle)
    showToast('info', translate('about:copied_handle'))
  }

  const navigation = useNavigation()
  const menuList = useMemo(
    () => [
      {
        title: translate('about:handle'),
        leftIcon: accountHandle,
        rightElement: (
          <View style={styles.handleContainer}>
            <Text style={[styles.subtitle, styles.handleText]}>{`...${handle.substr(handle.length - 6)}`}</Text>
            <SvgIcon style={styles.copyIcon} name={'copy-blue'} size={18} onPress={handlePressCopy} />
          </View>
        ),
      },
      {
        title: translate('about:app_version'),
        leftIcon: appVersion,
        rightElement: <Text style={styles.subtitle}>{`v${version} (${build})`}</Text>,
      },
      {
        title: translate('about:environment'),
        leftIcon: environment,
        rightElement: <Text style={styles.subtitle}>{capitalizeFirstLetter(USER_FACING_ENV)}</Text>,
      },
      {
        title: translate('about:tnc'),
        leftIcon: termsAndCondition,
        onPress: () => navigation.navigate('TermsAndConditions'),
        rightElement: <MenuItemRightChevron />,
      },
      {
        title: translate('about:privacy_policy'),
        leftIcon: privacyPolicy,
        onPress: () => navigation.navigate('PrivacyPolicy'),
        rightElement: <MenuItemRightChevron />,
      },
      {
        title: translate('about:send_logs'),
        leftIcon: about,
        onPress: () => console.sendLogs(),
        rightElement: <MenuItemRightChevron />,
      },
    ],
    [build],
  )

  const renderItem = ({ title, subtitle, textColor, leftIcon, onPress, rightElement }) => (
    <MenuItem
      key={title}
      title={title}
      subtitle={subtitle}
      textColor={textColor}
      leftIcon={leftIcon}
      onPress={onPress}
      rightElement={rightElement}
    />
  )

  return (
    <>
      <Header navigation={navigation} title={translate('profile:about')} />
      <Screen paddingHorizontal={0}>
        <View style={styles.verticalBuffer} />
        {menuList.map(renderItem)}
      </Screen>
    </>
  )
})
