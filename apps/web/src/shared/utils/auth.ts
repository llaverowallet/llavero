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
    }),
  ],
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
};
