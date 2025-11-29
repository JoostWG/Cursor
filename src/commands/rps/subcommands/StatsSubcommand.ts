import { MessageFlags, bold, heading } from 'discord.js';
import type { CursorDatabase } from '../../../database';
import { Subcommand, type SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { container, textDisplay } from '../../../lib/utils/builders';
import type { Choice } from '../Choice';
import { emojis } from '../emojis';

export class StatsSubcommand extends Subcommand {
    public constructor(private readonly db: CursorDatabase) {
        super();
    }

    protected override definition(): SubcommandDefinition {
        return {
            name: 'stats',
            description: 'Shows game stats',
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
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
