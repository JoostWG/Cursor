import { MessageFlags, bold, heading, type ChatInputCommandInteraction } from 'discord.js';
import { CommandError, SlashCommand, type ChatInputContext } from '../../core';
import type { CursorDatabase } from '../../setup';
import { container, subcommand, textDisplay, userOption } from '../../utils/builders';
import type { Choice } from './Choice';
import { emojis } from './emojis';
import { Game } from './Game';

export class RockPaperScissorsCommand extends SlashCommand {
    public constructor(private readonly db: CursorDatabase) {
        super({
            name: 'rps',
            description: 'Rock Paper Scissors',
            options: [
                subcommand({
                    name: 'play',
                    description: 'Play Rock Paper Scissors',
                    options: [
                        userOption({
                            name: 'opponent',
                            description: 'Choose your opponent',
                        }),
                    ],
                }),
                subcommand({
                    name: 'stats',
                    description: 'Shows game stats',
                }),
            ],
        });
    }

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case 'play':
                await this.play(interaction);
                break;

            case 'stats':
                await this.stats(interaction);
                break;
        }
    }

    private async play(interaction: ChatInputCommandInteraction): Promise<void> {
        const opponent = interaction.options.getUser('opponent', true);

        if (opponent.bot) {
            throw new CommandError('You cannot play against bots.');
        }

        if (opponent.id === interaction.user.id) {
            throw new CommandError('You cannot play against yourself.');
        }

        await new Game([interaction.user, opponent], this.db).start(interaction);
    }

    private async stats(interaction: ChatInputCommandInteraction): Promise<void> {
        const games = await this.db
            .selectFrom('rps_games')
            .where('user_id', '=', interaction.user.id)
            .select(({ fn }) => fn.count('id').as('count'))
            .executeTakeFirst();

        const choices = await this.db
            .selectFrom('rps_choices')
            .where('user_id', '=', interaction.user.id)
            .select(['choice', ({ fn }) => fn.count('id').as('count')])
            .groupBy('choice')
            .execute();

        const choiceCounts = new Map(choices.map((choice) => [choice.choice, choice.count]));

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                container({
                    components: [
                        textDisplay({
                            content: [
                                heading('RPS Stats'),
                                bold('Games played'),
                                games?.count ?? 0,
                                '',
                                bold('Choice stats'),
                                ...Object.entries(emojis).map(
                                    ([name, emoji]) =>
                                        `${emoji} ${choiceCounts.get(name as Choice) ?? 0}`,
                                ),
                            ].join('\n'),
                        }),
                    ],
                }),
            ],
        });
    }
}
