export interface CryptoMiddleware {
  getRandomValues(size: number): Promise<Uint8Array>
  getCryptoRandomValue(size: number): Buffer
  getPublicKey(k: Uint8Array | undefined): Promise<Uint8Array>
  derive(k: Uint8Array | undefined, p: string): Promise<Uint8Array>
  sign(k: Uint8Array | undefined, b: Uint8Array): Promise<Uint8Array>

  generateSymmetricKey(): Promise<Uint8Array>
  encrypt(k: Uint8Array | undefined, b: Uint8Array): Promise<Uint8Array>
  decrypt(k: Uint8Array | undefined, ct: Uint8Array): Promise<Uint8Array>
}
