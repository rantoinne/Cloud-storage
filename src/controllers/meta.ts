import { AccountSystem, MetadataAccess, CryptoMiddleware, Account, FileSystemShareConfig } from 'opacity-library'

export class MetaController {
  static crypto: CryptoMiddleware
  static storageNode: string
  static accountSystem: AccountSystem
  static metadataAccess: MetadataAccess
  static config: FileSystemShareConfig
  static account: Account
  static init(crypto, storageNode) {
    MetaController.crypto = crypto
    MetaController.storageNode = storageNode
    MetaController.metadataAccess = new MetadataAccess({ crypto, metadataNode: storageNode })
    MetaController.accountSystem = new AccountSystem({ metadataAccess: MetaController.metadataAccess })
    MetaController.account = new Account({ crypto, storageNode })
    MetaController.config = {
      crypto: crypto,
      storageNode: storageNode,
    }
  }

  static clear() {
    MetaController.crypto = undefined
    MetaController.storageNode = undefined
    MetaController.metadataAccess = undefined
    MetaController.accountSystem = undefined
    MetaController.config = undefined
    MetaController.account = undefined
  }
}
