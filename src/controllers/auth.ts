import { WebAccountMiddleware, Account, hex, mnemonic as mnemonicUtil, CryptoMiddleware } from 'opacity-library'
import { STORAGE_NODE as storageNode } from '@env'
import { MetaController } from './meta'
import { withTimeout } from '@utils'
import { UserType } from '@models/stores/models'

export class AuthController {
  /*  Usable only after login/signup, account object created after MetaController init */
  static async fetchUserData(): Promise<UserType> {
    return withTimeout<UserType>(MetaController.account.info())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static async signIn(handle): Promise<{ user: UserType; handle: string; crypto: CryptoMiddleware } | {}> {
    /* Sign in using user handle, get account info */
    const crypto = new WebAccountMiddleware({ asymmetricKey: hex.hexToBytes(handle) })
    MetaController.init(crypto, storageNode)
    const user = await AuthController.fetchUserData()
    return { user, handle, crypto }
  }

  static async signUp(handle): Promise<{ user; handle; crypto }> {
    /* Create mnemonic phrases and handle, sign up, then get account info */
    const crypto = new WebAccountMiddleware({ asymmetricKey: hex.hexToBytes(handle) })
    const account = await new Account({ crypto, storageNode })
    await account.signUp({ size: 10 })
    MetaController.init(crypto, storageNode)
    const user = await AuthController.fetchUserData()
    return { user, handle, crypto }
  }

  static async createHandle(): Promise<{ mnemonic; handle }> {
    /* Create mnemonic phrases and handle, sign up, then get account info */
    const mnemonic = await mnemonicUtil.createMnemonic()
    const handleBytes = await mnemonicUtil.mnemonicToHandle(mnemonic)
    return { mnemonic, handle: hex.bytesToHex(handleBytes) }
  }

  static async recoverHandle(mnemonic): Promise<{ handle }> {
    const handleBytes = await mnemonicUtil.retrieveHandle(mnemonic)
    const handle = hex.bytesToHex(handleBytes)
    /* Implicitly sign in to check if the mnemonic are correct or not */
    const crypto = new WebAccountMiddleware({ asymmetricKey: hex.hexToBytes(handle) })
    await new Account({ crypto, storageNode }).info()
    return { handle }
  }
}
