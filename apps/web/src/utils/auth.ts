import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { AuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { authLogger } from "./logger";

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
const issuer = "https://cognito-idp.us-east-1.amazonaws.com/"+process.env.USER_POOL_ID;
const clientId = process.env.USER_POOL_CLIENT_ID ?? "emptyCognitoClientId";
export const AUTH_OPTIONS: AuthOptions = {
    debug: true,
    logger: authLogger,
    providers: [
      CognitoProvider({
          issuer: issuer,
          clientId: clientId,
          clientSecret: process.env.POOL_SECRET ?? "emptyCognitoClientSecret",
      }),
    ],
  }
// Use it in server contexts
// export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextRequest, NextResponse] | []) {
//   return getServerSession(...args, AUTH_OPTIONS)
// }