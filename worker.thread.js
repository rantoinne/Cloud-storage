import { self } from 'react-native-threads'
import ReactNativeBlobUtil from 'react-native-blob-util'
import AesGcmCrypto from 'react-native-aes-gcm-crypto'

global.process.version = 'v14.17.1'

self.onmessage = async message => {
  const Buffer = require('buffer').Buffer

  const { requestBody, statusPayload, arrayBuffer, key, uploadURL, type, initialIv } = JSON.parse(message)
  const d = hexToBytes(arrayBuffer)
  const k = hexToBytes(key)
  async function createBody(chunk) {
    const p = new Uint8Array(sizeOnFS(chunk.length))
    const chunks = []
    for (let i = 0; i < numberOfBlocks(chunk.length); i++) {
      const block = chunk.slice(i * blockSize, (i + 1) * blockSize)
      chunks.push(block)
    }

    await Promise.all(
      chunks.map(async (block, i) => {
        const encryptedData = await AesGcmCrypto.encrypt(
          Buffer.from(block).toString('base64'),
          true,
          Buffer.from(k).toString('base64'),
          initialIv,
        )

        const tag = hexToBytes(encryptedData.tag)
        const iv = hexToBytes(encryptedData.iv)

        const encrypted = new Uint8Array([...Buffer.from(encryptedData.content, 'base64'), ...tag, ...iv])

        let byteIndex = 0
        for (const byte of encrypted) {
          p[i * blockSizeOnFS + byteIndex] = byte
          byteIndex++
        }

        return encrypted
      }),
    )

    return p
  }

  const encryptedData = await createBody(d)

  const otherPayload = JSON.parse(statusPayload)

  const res = await ReactNativeBlobUtil.fetch('POST', uploadURL, { 'Content-Type': 'multipart/form-data' }, [
    {
      type,
      name: 'chunkData',
      filename: 'chunkData',
      data: Buffer.from(encryptedData).toString('base64'),
    },
    // elements without property `filename` will be sent as plain text
    { name: 'requestBody', data: requestBody },
    { name: 'signature', data: otherPayload.signature },
    { name: 'hash', data: otherPayload.hash },
    { name: 'publicKey', data: otherPayload.publicKey },
  ])

  const response = await res.json()

  self.postMessage(JSON.stringify(response))
}

const hexToBytes = h => {
  return new Uint8Array((h.match(/.{1,2}/g) || []).map(b => parseInt(b, 16)))
}

const blockSize = 64 * 1024
const blockOverhead = 32
const blockSizeOnFS = blockSize + blockOverhead

const numberOfBlocks = size => {
  return Math.ceil(size / blockSize)
}

const sizeOnFS = size => {
  return size + blockOverhead * numberOfBlocks(size)
}
