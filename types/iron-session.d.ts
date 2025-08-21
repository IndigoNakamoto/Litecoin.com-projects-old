import 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number
      admin?: boolean
    }
  }
}
