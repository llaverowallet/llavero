import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { AUTH_OPTIONS } from './shared/utils/auth';

const allowedOrigins = process.env.NODE_ENV === 'production' ? ['*'] : ['*'];

// TODO: Find a way to enable middleware (error with instrumentation function)
export async function middleware(request: NextApiRequest, response: NextApiResponse) {
  const origin = request.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return response.status(403).json({ message: 'Forbidden' });
  }

  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email) {
      return response.status(401).json({ message: 'Not authorized' });
    }

    return response.status(200).json({ message: 'Next' });
  } catch (error) {
    // logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}

export const config = {
  matcher: ['/api/accounts/:path*', '/api/wallet/:path*'],
};
