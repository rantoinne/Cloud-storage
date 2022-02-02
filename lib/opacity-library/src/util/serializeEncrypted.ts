import { CryptoMiddleware } from '../interfaces/CryptoMiddleware'

export const serializeEncrypted = async <T,>(
  crypto: CryptoMiddleware,
  bytes: Uint8Array,
  key: Uint8Array,
): Promise<T> => {
  const v = await crypto.decrypt(key, bytes)
  // eslint-disable-next-line no-undef
  const s = new TextDecoder('utf-8').decode(v)

  return JSON.parse(s) as T
}
