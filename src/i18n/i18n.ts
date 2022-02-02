import RNLocalize from 'react-native-localize'
import i18next from 'i18next'
import en from './locale/en.json'
import fr from './locale/fr.json'

const locale = RNLocalize.getLocales()[0]
i18next.init(
  {
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    resources: { en, fr },
    returnObjects: true,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // not needed for react as it does escape per default to prevent xss!
    },
  },
  () => {
    i18next.changeLanguage(locale.languageCode || 'en')
  },
)

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof en
type RecursiveKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${TKey}` | `${TKey}:${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & string]

// For common types only
type DefaultCommonLocale = typeof en.common
type RecursiveCommonKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${RecursiveCommonKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & string]

// For options types only
type DefaultOptionsLocale = typeof en.options
type RecursiveOptionsKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${RecursiveOptionsKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & string]

export type TxOptionsKeyPath = RecursiveOptionsKeyOf<DefaultOptionsLocale>
export type TxKeyPath = RecursiveKeyOf<DefaultLocale> | RecursiveCommonKeyOf<DefaultCommonLocale>
