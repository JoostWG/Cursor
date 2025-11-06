import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Subcommand } from '../../../lib/core';
import type { TagManager } from '../TagManager';
import type { TagData } from '../types';

export abstract class TagSubcommand extends Subcommand {
    public constructor(protected readonly tags: TagManager) {
        super();
    }

    public override async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(interaction);
    }

    protected override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!interaction.guildId) {
            return [];
        }

        const tags = await this.tags.list(interaction.guildId);

        const q = interaction.options.getFocused().toLowerCase();

        return tags
            .toSorted((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q))
            .map((tag) => ({ name: tag.name, value: tag.name }));
    }

    protected async findTagOrFail(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<TagData> {
        return await this.tags.find(
            interaction.guildId,
            interaction.options.getString('name', true),
            { fail: true },
        );
    }

    protected abstract override handle(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void>;
}
