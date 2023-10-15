import NextAuth, { AuthOptions } from "next-auth";
import { Config } from "sst/node/config";
import { AUTH_OPTIONS } from "@/utils/auth";
import { getParameterValue } from "@/utils/aws";



// const siteUrl = getParameterValue(process.env.SITEURL_PARAM_NAME ?? "emptySiteUrlParamName");
// process.env.NEXTAUTH_URL = siteUrl;
// console.log("NEXTAUTH_URL", Config.LLAVERO_URL);
// process.env.NEXTAUTH_URL = Config.LLAVERO_URL;

console.log("USER_POOL_ID ---->>>>>>>", process.env.USER_POOL_ID);
console.log("NEXTAUTH_URL ---->>>>>>>", process.env.NEXTAUTH_URL);

const handler = NextAuth(AUTH_OPTIONS);
export { handler as GET, handler as POST }
