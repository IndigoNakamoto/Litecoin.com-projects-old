import 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    user: {
      isLoggedIn: boolean
    }
  }
}
