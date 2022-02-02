import i18next, { TOptions } from 'i18next'
import { TxKeyPath } from './i18n'
export * from './i18n'

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: TxKeyPath, options?: TOptions) {
  return key ? i18next.t(key, options) : null
}
