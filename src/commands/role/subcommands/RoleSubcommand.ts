import { Subcommand } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { RoleService } from '../RoleService';

export abstract class RoleSubCommand extends Subcommand {
    protected readonly roleService: RoleService;

    public constructor() {
        super();

        this.roleService = new RoleService();
    }

    public override async invoke(ctx: ChatInputContext): Promise<void> {
        if (!ctx.interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(ctx);
    }

    protected abstract override handle(ctx: ChatInputContext<'cached'>): Promise<void>;
}
