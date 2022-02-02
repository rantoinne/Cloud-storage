import { self } from 'react-native-threads'
import ReactNativeBlobUtil from 'react-native-blob-util'
import AesGcmCrypto from 'react-native-aes-gcm-crypto'
import { Buffer } from 'buffer'
global.process.version = 'v14.17.1'

self.onmessage = async message => {
  const { partIndex, downloadUrl, key, _sizeOnFS } = JSON.parse(message)

  const blockSize = 64 * 1024
  const blockOverhead = 32
  const blockSizeOnFS = blockSize + blockOverhead
  const blocksPerPart = 80
  const partSizeOnFS = blocksPerPart * blockSizeOnFS

  const sizeOnFS = size => {
    return size + blockOverhead * numberOfBlocks(size)
  }

  const numberOfBlocks = size => {
    return Math.ceil(size / blockSize)
  }

  const numberOfBlocksOnFS = sizeOnFS => {
    return Math.ceil(sizeOnFS / blockSizeOnFS)
  }

  const bytesToHex = b => {
    return b
      .reduce((acc, n) => {
        acc.push(('00' + n.toString(16)).slice(-2))
        return acc
      }, [])
      .join('')
  }

  const response = await ReactNativeBlobUtil.fetch('GET', downloadUrl, {
    range: `bytes=${partIndex * partSizeOnFS}-${Math.min(_sizeOnFS, (partIndex + 1) * partSizeOnFS) - 1}`,
  })

  const part = new Uint8Array(Buffer.from(await response.base64(), 'base64'))

  const data = Array(numberOfBlocksOnFS(part.length)).fill('')

  for (let j = 0; j < numberOfBlocksOnFS(part.length); j++) {
    const block = part.slice(j * blockSizeOnFS, (j + 1) * blockSizeOnFS)
    const iv = bytesToHex(Buffer.from(block.subarray(block.length - 16)))
    const tag = bytesToHex(Buffer.from(block.subarray(block.length - 32, block.length - 16)))
    const cipher = Buffer.from(block.subarray(0, block.length - 32)).toString('base64')
    const decrypted = await AesGcmCrypto.decrypt(cipher, key, iv, tag, true).catch(console.log)
    data[j] = Buffer.from(decrypted, 'base64').toString('binary')
  }
  self.postMessage(JSON.stringify(data))
}