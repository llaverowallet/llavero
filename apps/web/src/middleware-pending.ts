import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_OPTIONS } from './shared/utils/auth';

const allowedOrigins = process.env.NODE_ENV === 'production' ? ['*'] : ['*'];

// TODO: Find a way to enable middleware (error with instrumentation function)
export async function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email)
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

    return NextResponse.next();
  } catch (error) {
    // logger.error(error);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ['/api/accounts/:path*', '/api/wallet/:path*'],
};
