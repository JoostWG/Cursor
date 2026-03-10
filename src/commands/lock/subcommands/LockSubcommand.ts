import { Subcommand } from '../../../lib/core';
import type { LockService } from '../../../services';

export abstract class LockSubcommand extends Subcommand {
    protected readonly lockService: LockService;

    public constructor(lockService: LockService) {
        super();

        this.lockService = lockService;
    }
}
