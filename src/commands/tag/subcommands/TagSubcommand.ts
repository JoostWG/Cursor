import type {
    APIApplicationCommandStringOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Subcommand } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { autocompleteResults, type OmitType } from '../../../lib/utils';
import { stringOption } from '../../../lib/utils/builders';
import type { TagManager } from '../TagManager';
import type { TagData } from '../types';

export abstract class TagSubcommand extends Subcommand {
    public constructor(protected readonly tags: TagManager) {
        super();
    }

    public override async invoke(ctx: ChatInputContext): Promise<void> {
        if (!ctx.interaction.inCachedGuild()) {
            return;
        }

        await super.invoke(ctx);
    }

    protected override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!interaction.guildId) {
            return [];
        }

        return autocompleteResults(
            interaction.options.getFocused().toLowerCase(),
            await this.tags.list(interaction.guildId),
            (tag) => tag.name,
        );
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
