import 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
<<<<<<< HEAD
    user?: {
      id: number
      admin?: boolean
=======
    user: {
      isLoggedIn: boolean
>>>>>>> 8fbf80e (feat(admin): add admin dashboard with donation and summary tables)
    }
  }
}
