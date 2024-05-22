import { getParameterValue } from '@/shared/utils/aws';
import createLogger from '@/shared/utils/logger';
const logger = createLogger('Instrumentation');

export async function register() {
  // @ts-expect-error 🚧 ETHERS IS BROKEN. THIS IS A WORKAROUND
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  try {
    console.log('registering instrumentation');
    const siteUrlParamName = process.env.SITEURL_PARAM_NAME;
    if (siteUrlParamName) {
      try {
        const siteUrl = await getParameterValue(siteUrlParamName);
        process.env.NEXTAUTH_URL = siteUrl;
        process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
      } catch (paramError) {
        if ((paramError as Error).name === 'ParameterNotFound') {
          console.warn('Parameter not found. Using default URL.');
          process.env.NEXTAUTH_URL = 'http://localhost:3000';
          process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        } else {
          throw paramError;
        }
      }
    } else {
      console.warn('SITEURL_PARAM_NAME is not set. Using default URL.');
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    }
  } catch (error) {
    console.log({ error });
    logger.error(error);
    throw new AggregateError([new Error('Error in instrumentation'), error]);
  }
}
