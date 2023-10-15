import { getParameterValue, updateUserPoolClientCallbackUrl } from '@/utils/aws';
import createLogger from "@/utils/logger";
const logger = createLogger("Instrumentation");
 
export async function register() {
  // @ts-expect-error 🚧 ETHERS IS BROKEN. THIS IS A WORKAROUND
  BigInt.prototype.toJSON = function () {
    return this.toString();
  }

 try {
   console.log("registering instrumentation");
   const siteUrl = await getParameterValue(process.env.SITEURL_PARAM_NAME ?? "emptySiteUrlParamName");
   process.env.NEXTAUTH_URL = siteUrl;
 } catch (error) {
    logger.error(error);
    throw new AggregateError([new Error("Error in instrumentation"), error]);
 }
}