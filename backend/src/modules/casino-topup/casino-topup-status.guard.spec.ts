// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
import { UnauthorizedException } from '@nestjs/common';
import { CasinoTopupStatusGuard } from './casino-topup-status.guard';

function makeContext(headers: Record<string, string>): any {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  };
}

describe('CasinoTopupStatusGuard', () => {
  const ORIGINAL_ENV = process.env.CASINO_TOPUP_STATUS_API_KEY;

  afterEach(() => {
    process.env.CASINO_TOPUP_STATUS_API_KEY = ORIGINAL_ENV;
  });

  it('fails closed when the shared secret is not configured, even with a header present', () => {
    delete process.env.CASINO_TOPUP_STATUS_API_KEY;
    const guard = new CasinoTopupStatusGuard();
    expect(() => guard.canActivate(makeContext({ 'x-casino-status-key': 'anything' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a missing header', () => {
    process.env.CASINO_TOPUP_STATUS_API_KEY = 'correct-secret';
    const guard = new CasinoTopupStatusGuard();
    expect(() => guard.canActivate(makeContext({}))).toThrow(UnauthorizedException);
  });

  it('rejects a wrong header value', () => {
    process.env.CASINO_TOPUP_STATUS_API_KEY = 'correct-secret';
    const guard = new CasinoTopupStatusGuard();
    expect(() => guard.canActivate(makeContext({ 'x-casino-status-key': 'wrong-secret' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a value of a different length without throwing a length-related crash (constant-time compare path)', () => {
    process.env.CASINO_TOPUP_STATUS_API_KEY = 'correct-secret';
    const guard = new CasinoTopupStatusGuard();
    expect(() => guard.canActivate(makeContext({ 'x-casino-status-key': 'short' }))).toThrow(UnauthorizedException);
  });

  it('accepts the correct header value', () => {
    process.env.CASINO_TOPUP_STATUS_API_KEY = 'correct-secret';
    const guard = new CasinoTopupStatusGuard();
    expect(guard.canActivate(makeContext({ 'x-casino-status-key': 'correct-secret' }))).toBe(true);
  });
});
