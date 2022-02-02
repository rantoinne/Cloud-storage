import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { useNavigation } from '@react-navigation/native'
import { TERMS_AND_CONDITIONS_URL } from '@env'
import { Screen, Header, Loader } from '@components'
import { translate } from '@i18n'
import styles from './styles'

export const TermsAndConditionsScreen = observer(() => {
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
      <Header navigation={navigation} title={translate('about:tnc')} />
      <Screen>
        <WebView
          style={styles.webView}
          source={{ uri: TERMS_AND_CONDITIONS_URL }}
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
