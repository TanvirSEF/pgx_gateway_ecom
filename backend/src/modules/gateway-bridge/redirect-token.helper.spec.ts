import { openRedirectUrl, sealRedirectUrl } from './redirect-token.helper';

describe('redirect-token.helper', () => {
  const secret = 'test-gateway-redirect-secret';

  it('seals and opens an HTTP(S) merchant URL round-trip', () => {
    const url = 'https://merchant-store.example/checkout/success?order=9912';
    const token = sealRedirectUrl(url, secret);

    expect(token).toBeTruthy();
    expect(token).not.toContain('merchant-store');
    expect(Buffer.from(token, 'base64url').toString('utf8')).not.toContain('merchant-store.example');
    expect(openRedirectUrl(token, secret)).toBe(url);
  });

  it('rejects tampered tokens, plain base64url URLs, and wrong secrets', () => {
    const url = 'https://merchant-store.example/return';
    const token = sealRedirectUrl(url, secret);
    const tampered = `${token.slice(0, -2)}AA`;
    const plainBase64 = Buffer.from(url).toString('base64url');

    expect(openRedirectUrl(tampered, secret)).toBeNull();
    expect(openRedirectUrl(plainBase64, secret)).toBeNull();
    expect(openRedirectUrl(token, 'wrong-secret')).toBeNull();
  });

  it('rejects non-HTTP(S) schemes on seal', () => {
    expect(sealRedirectUrl('javascript:alert(1)', secret)).toBe('');
    expect(sealRedirectUrl('not-a-url', secret)).toBe('');
    expect(sealRedirectUrl('', secret)).toBe('');
  });
});
