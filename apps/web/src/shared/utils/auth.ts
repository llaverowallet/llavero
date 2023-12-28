import { AuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { authLogger } from './logger';

const issuer =
  'https://cognito-idp.' + process.env.REGION + '.amazonaws.com/' + process.env.USER_POOL_ID;
const clientId = process.env.USER_POOL_CLIENT_ID ?? 'emptyCognitoClientId';
export const AUTH_OPTIONS: AuthOptions = {
  debug: true,
  logger: authLogger,
  providers: [
    CognitoProvider({
      issuer: issuer,
      clientId: clientId,
      clientSecret: process.env.POOL_SECRET ?? 'emptyCognitoClientSecret',
      authorization : { 
        params: { scope: 'openid profile aws.cognito.signin.user.admin' }
      },
      
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token = { ...token, ...account }
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      const newSession: any = { ...session };
      newSession.accessToken = token.access_token;
      return newSession
    }
  },
};
