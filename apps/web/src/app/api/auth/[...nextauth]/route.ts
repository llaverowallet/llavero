import NextAuth, { AuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito";

const issuer = "https://cognito-idp.us-east-1.amazonaws.com/"+process.env.USER_POOL_ID;
const clientId = process.env.USER_POOL_CLIENT_ID ?? "emptyCognitoClientId";
console.log("USER_POOL_ID ---->>>>>>>", process.env.USER_POOL_ID);
console.log("NEXTAUTH_URL ---->>>>>>>", process.env.NEXTAUTH_URL);
const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  debug: true,
  providers: [
    CognitoProvider({
        issuer: issuer,
        clientId: clientId,
        clientSecret: process.env.POOL_SECRET ?? "emptyCognitoClientSecret",
        
    }),
    // ...add more providers here
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }