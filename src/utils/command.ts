import { localize } from '.';
import { Client } from '..';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export abstract class BaseCommand {
    protected client: Client;
    public devOnly?: boolean;
    public readonly data = new SlashCommandBuilder();

    public constructor(client: Client, name: string) {
        this.client = client;

        this.data = localize(SlashCommandBuilder, name, name);
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
