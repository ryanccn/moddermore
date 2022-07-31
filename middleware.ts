import { NextResponse, type NextRequest } from 'next/server';

export const middleware = async (req: NextRequest): Promise<Response> => {
  return NextResponse.rewrite(new URL('/whoops', req.url));
};

export const config = {
  matcher: ['/', '/new/:match*', '/new', '/list/:match*'],
};
