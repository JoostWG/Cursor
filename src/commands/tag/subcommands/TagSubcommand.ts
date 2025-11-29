import type {
    APIApplicationCommandStringOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Subcommand } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import type { OmitType } from '../../../lib/utils';
import { stringOption } from '../../../lib/utils/builders';
import type { TagManager } from '../TagManager';
import type { TagData } from '../types';

export abstract class TagSubcommand extends Subcommand {
    public constructor(protected readonly tags: TagManager) {
        super();
    }

    public override async invoke(context: ChatInputContext): Promise<void> {
        if (!context.interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(context);
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

    protected nameOption(
        override?: Partial<OmitType<APIApplicationCommandStringOption>>,
    ): APIApplicationCommandStringOption {
        return stringOption({
            name: 'name',
            description: 'tag name',
            required: true,
            autocomplete: true,
            ...override ?? {},
        });
    }

    protected contentOption(
        override?: Partial<OmitType<APIApplicationCommandStringOption>>,
    ): APIApplicationCommandStringOption {
        return stringOption({
            name: 'content',
            description: 'tag content',
            required: true,
            ...override ?? {},
        });
    }

    protected abstract override handle({ interaction }: ChatInputContext<'cached'>): Promise<void>;
}
