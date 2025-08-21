import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { getIronSession } from 'iron-session'
import { sessionOptions } from './session'
import { IronSessionData } from 'iron-session'

export function withAdminAuth(gssp: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    const session = await getIronSession<IronSessionData>(
      context.req,
      context.res,
      sessionOptions
    )

    if (!session.user) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      }
    }

    return await gssp(context)
  }
}
