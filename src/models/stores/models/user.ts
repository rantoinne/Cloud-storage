import { types, Instance } from 'mobx-state-tree'

/* Account model */
export const AccountModel = types.model('Account', {
  createdAt: types.string,
  updatedAt: types.string,
  expirationDate: types.string,
  // number of months in their subscription
  monthsInSubscription: types.number,
  // how much storage they are allowed, in GB
  storageLimit: types.number,
  // how much storage they have used, in GB
  storageUsed: types.number,
  // the eth address they will send payment to
  ethAddress: types.string,
  cost: types.number,
  apiVersion: types.number,
  totalFolders: types.number,
  totalMetadataSizeInMB: types.number,
  maxFolders: types.number,
  maxMetadataSizeInMB: types.number,
})
export type AccountType = Instance<typeof AccountModel>

/* Stripe model */
export const StripeModel = types.model('Stripe', {
  stripePaymentExists: types.boolean,
  chargePaid: types.boolean,
  stripeToken: types.string,
  opctTxStatus: types.string,
  chargeID: types.string,
  amount: types.number,
})
export type StripeType = Instance<typeof StripeModel>

/* Invoice model */
export const InvoiceModel = types.model('Invoice', {
  cost: types.number,
  ethAddress: types.string,
})
export type InvoiceType = Instance<typeof InvoiceModel>

/* PaymentStatus model */
export const PaymentStatusModel = types.enumeration(['unpaid', 'pending', 'paid', 'expired'])
export type PaymentStatusType = Instance<typeof PaymentStatusModel>

/* User model */
export const UserModel = types.model('User', {
  error: types.maybeNull(types.string),
  paymentStatus: PaymentStatusModel,
  account: AccountModel,
  stripeData: StripeModel,
  invoice: types.maybe(InvoiceModel),
})
export type UserType = Instance<typeof UserModel>
