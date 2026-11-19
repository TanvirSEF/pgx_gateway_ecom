import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id') || '';
  const redir = searchParams.get('redir') || '';

  let targetUrl = 'https://pgxmarketplace.shop';

  if (redir) {
    try {
      const decoded = Buffer.from(redir, 'base64url').toString('utf-8');
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        targetUrl = decoded;
        if (sessionId && targetUrl.includes('{CHECKOUT_SESSION_ID}')) {
          targetUrl = targetUrl.replace('{CHECKOUT_SESSION_ID}', encodeURIComponent(sessionId));
        } else if (sessionId && !targetUrl.includes('session_id=')) {
          const separator = targetUrl.includes('?') ? '&' : '?';
          targetUrl = `${targetUrl}${separator}session_id=${encodeURIComponent(sessionId)}`;
        }
      }
    } catch {
      // Fallback to homepage
    }
  }

  try {
    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect(new URL('/', req.url), 302);
  }
}
