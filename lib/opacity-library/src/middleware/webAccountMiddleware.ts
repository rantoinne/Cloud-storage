import HDKey from 'hdkey/lib/hdkey'
import { CryptoMiddleware } from '../interfaces/CryptoMiddleware'
import { hashToPath, pathHash } from '../util/derive'
import isoCrypto from 'isomorphic-webcrypto'
import crypto from 'crypto'
import AesGcmCrypto from 'react-native-aes-gcm-crypto'
import { bytesToHex, hexToBytes } from '../util/hex'

export type WebAccountMiddlewareArgs = {
  asymmetricKey?: Uint8Array
  symmetricKey?: Uint8Array
}

const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
export class WebAccountMiddleware implements CryptoMiddleware {
  asymmetricKey?: Uint8Array
  symmetricKey?: Uint8Array

  constructor({ symmetricKey, asymmetricKey }: WebAccountMiddlewareArgs = {}) {
    this.asymmetricKey = asymmetricKey
    this.symmetricKey = symmetricKey
  }

  getCryptoRandomValue(size: number): Buffer {
    return crypto.randomBytes(size)
  }

  async getRandomValues(size: number): Promise<Uint8Array> {
    await isoCrypto.ensureSecure()
    return isoCrypto.getRandomValues(new Uint8Array(size))
  }

  async getPublicKey(k: Uint8Array | undefined = this.asymmetricKey): Promise<Uint8Array> {
    if (k === undefined) {
      throw new ReferenceError('WebAccountMiddleware: key must not be undefined')
    }

    const hd = new HDKey()
    hd.privateKey = Buffer.from(k.slice(0, 32))
    hd.chainCode = Buffer.from(k.slice(32))

    return hd.publicKey
  }

  async derive(k: Uint8Array | undefined = this.asymmetricKey, p: string): Promise<Uint8Array> {
    if (k === undefined) {
      throw new ReferenceError('WebAccountMiddleware: key must not be undefined')
    }

    const hd = new HDKey()
    hd.privateKey = Buffer.from(k.slice(0, 32))
    hd.chainCode = Buffer.from(k.slice(32))

    const child = hd.derive('m/' + hashToPath(pathHash(p)))

    return new Uint8Array(Array.from(child.privateKey).concat(Array.from(child.chainCode)))
  }

  async sign(k: Uint8Array | undefined = this.asymmetricKey, d: Uint8Array): Promise<Uint8Array> {
    if (k === undefined) {
      throw new ReferenceError('WebAccountMiddleware: key must not be undefined')
    }

    const hd = new HDKey()
    hd.privateKey = Buffer.from(k.slice(0, 32))
    hd.chainCode = Buffer.from(k.slice(32))

    const sig = hd.sign(Buffer.from(d))

    return sig
  }

  async generateSymmetricKey(): Promise<Uint8Array> {
    await isoCrypto.ensureSecure()
    const key = await isoCrypto.subtle.exportKey(
      'raw',
      await isoCrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']),
    )
    return new Uint8Array(key)
  }

  async encrypt(k: Uint8Array | undefined = this.symmetricKey, d: Uint8Array): Promise<Uint8Array> {
    if (k === undefined) {
      throw new ReferenceError('WebAccountMiddleware: key must not be undefined')
    }

    const encryptedData = await AesGcmCrypto.encrypt(
      Buffer.from(d).toString('base64'),
      true,
      Buffer.from(k).toString('base64'),
      crypto.randomBytes(16).toString('base64'),
    )

    const tag = fromHexString(encryptedData.tag)
    const iv = fromHexString(encryptedData.iv)

    console.log('cipher generated')

    return new Uint8Array([...Buffer.from(encryptedData.content, 'base64'), ...tag, ...iv])
  }

  async decrypt(k: Uint8Array | undefined = this.symmetricKey, ct: Uint8Array): Promise<Uint8Array> {
    if (k === undefined) {
      throw new ReferenceError('WebAccountMiddleware: key must not be undefined')
    }

    const iv = bytesToHex(Buffer.from(ct.subarray(ct.length - 16)))
    const tag = bytesToHex(Buffer.from(ct.subarray(ct.length - 32, ct.length - 16)))
    const key = Buffer.from(k).toString('base64')
    const cipher = Buffer.from(ct.subarray(0, ct.length - 32)).toString('base64')

    const data = await AesGcmCrypto.decrypt(cipher, key, iv, tag, true).catch(console.log)
    return new Uint8Array([...Buffer.from(data, 'base64')])
  }
}
