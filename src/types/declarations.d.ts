declare module '@env' {
  export const DEFAULT_STORAGE_NODE: string
  export const STORAGE_NODE: string
  export const PRIVATE_SHARE_URL: string
  export const PUBLIC_SHARE_URL: string
  export const PRIVACY_POLICY_URL: string
  export const HELP_CENTER_URL: string
  export const TERMS_AND_CONDITIONS_URL: string
  export const HANDLE: string
  export const CURRENT_ENV: string
  export const SENTRY_STAGE: string
  export const SENTRY_DSN: string
}

declare module '*.svg' {
  const content: any
  export default content
}

declare type PatchType = 'replace' | 'add' | 'remove'

declare type RouteParams = {
  params: { [values: string]: any }
  key: string
  name: string
}

declare type FileType = {
  name: string
  isDir: boolean
  path?: string
  size?: number
  status?: string
  progress?: number
  starred?: boolean
  type?: string
}

declare type MenuOptions = {
  type: MenuType
  items: MenuItem[]
}
