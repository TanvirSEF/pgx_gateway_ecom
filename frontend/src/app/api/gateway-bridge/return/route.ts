import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiBase = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  const backendReturnUrl = new URL(`${apiBase}/gateway-bridge/return`);

  searchParams.forEach((value, key) => {
    backendReturnUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(backendReturnUrl.toString(), {
    status: 302,
    headers: {
      'Referrer-Policy': 'no-referrer',
    },
  });
}
