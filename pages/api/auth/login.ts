import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { IronSessionData } from 'iron-session'

export default async function loginRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession<IronSessionData>(
    req,
    res,
    sessionOptions
  )

  if (
    !process.env.ADMIN_PASSWORD ||
    req.body.password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  session.user = {
    id: 1,
    admin: true,
  }
  await session.save()
  res.json({ ok: true })
}
