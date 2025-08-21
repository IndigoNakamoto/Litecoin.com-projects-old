import { SessionOptions } from 'iron-session'

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET as string,
  cookieName: 'litecoin-open-source-fund-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
