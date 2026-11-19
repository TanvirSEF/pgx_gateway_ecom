import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const encodedUrl = searchParams.get('s') || '';

  let targetStripeUrl = 'https://pgxmarketplace.shop';
  if (encodedUrl) {
    try {
      const decoded = Buffer.from(encodedUrl, 'base64url').toString('utf-8');
      if (decoded.startsWith('https://checkout.stripe.com/')) {
        targetStripeUrl = decoded;
      }
    } catch {
      // Fallback
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>PGX MarketPlace — Secure Checkout</title>
  <style>
    body {
      background-color: #0c0728;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid rgba(255,255,255,0.12);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .brand span { color: #8b5cf6; }
    p { font-size: 13px; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="brand">PGX <span>MARKETPLACE</span></div>
  <p>Connecting to 256-bit encrypted checkout...</p>
  <script>
    var target = ${JSON.stringify(targetStripeUrl)};
    if (window.top !== window.self) {
      window.top.location.replace(target);
    } else {
      window.location.replace(target);
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
