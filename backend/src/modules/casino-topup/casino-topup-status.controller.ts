// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
//
// Service-to-service ONLY (CasinoTopupStatusGuard) - the browser never
// calls this directly. Preferred architecture per the task: Casino
// frontend -> authenticated Casino backend -> THIS endpoint -> MongoDB.
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { CasinoTopupStatusGuard } from './casino-topup-status.guard';
import { CasinoTopupStatusService } from './casino-topup-status.service';

@ApiExcludeController() // internal, service-to-service only - keep it out of the public Swagger surface
@Controller('casino-topup/status')
@UseGuards(CasinoTopupStatusGuard)
export class CasinoTopupStatusController {
  constructor(private readonly statusService: CasinoTopupStatusService) {}

  @Get(':topupId')
  async getStatus(@Param('topupId') topupId: string, @Query('globalUserId') globalUserId: string) {
    // globalUserId comes from the CALLER (Casino's own backend, already
    // behind its player-session auth) - this service never trusts a
    // browser-supplied id, it only trusts the ALREADY-authenticated caller
    // that is itself gated by CasinoTopupStatusGuard above.
    return this.statusService.getStatusForCasinoUser(topupId, globalUserId);
  }
}
