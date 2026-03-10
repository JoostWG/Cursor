import { Subcommand } from '../../../lib/core';
import type { LockService } from '../../../services';

export abstract class UnlockSubcommand extends Subcommand {
    protected readonly lockService: LockService;

    public constructor(lockService: LockService) {
        super();

        this.lockService = lockService;
    }
}
