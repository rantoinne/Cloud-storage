import React, { useState } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { Screen, Header, Loader } from '@components'
import { PRIVACY_POLICY_URL } from '@env'
import styles from './styles'
import { translate } from '@i18n'
import { spacing } from '@theme'

export const PrivacyPolicyScreen = observer(() => {
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const injectedScript = () => {
    return `
    function hideHeaderToggle() {
      var headerToggle = document.getElementsByClassName("navbar"), i;
      for (i = 0; i < headerToggle.length; i += 1) {
        headerToggle[i].style.display = "none";
      };
      var titleToggle = document.getElementsByClassName("title"), i;
      for (i = 0; i < titleToggle.length; i += 1) {
        titleToggle[i].style.display = "none";
      };
      var hr = document.getElementsByTagName("hr"), i;
      for (i = 0; i < hr.length; i += 1) {
        hr[i].style.display = "none";
      };
      var footer = document.getElementsByTagName("footer"), i;
      for (i = 0; i < footer.length; i += 1) {
        footer[i].style.display = "none";
      };
    }; 
    hideHeaderToggle();
    `
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onMessage = (message: WebViewMessageEvent) => {}

  return (
    <>
      <Header navigation={navigation} title={translate('about:privacy_policy')} />
      <Screen paddingHorizontal={spacing[4]}>
        <WebView
          style={styles.webView}
          source={{ uri: PRIVACY_POLICY_URL }}
          // injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT
          injectedJavaScript={injectedScript()}
          onMessage={onMessage}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
        />
        <Loader isVisible={isLoading} />
      </Screen>
    </>
  )
})
