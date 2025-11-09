import type { ChatInputCommandInteraction } from 'discord.js';
import { Subcommand } from '../../../lib/core';
import { RoleService } from '../RoleService';

export abstract class RoleSubCommand extends Subcommand {
    protected readonly roleService: RoleService;

    public constructor() {
        super();

        this.roleService = new RoleService();
    }

    public override async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(interaction);
    }

    protected abstract override handle(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void>;
}
