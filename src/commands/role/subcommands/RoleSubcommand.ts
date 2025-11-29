import { Subcommand } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { RoleService } from '../RoleService';

export abstract class RoleSubCommand extends Subcommand {
    protected readonly roleService: RoleService;

    public constructor() {
        super();

        this.roleService = new RoleService();
    }

    public override async invoke(context: ChatInputContext): Promise<void> {
        if (!context.interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(context);
    }

    protected abstract override handle(context: ChatInputContext<'cached'>): Promise<void>;
}
