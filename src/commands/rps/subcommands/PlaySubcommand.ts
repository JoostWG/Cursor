import { CommandError } from '../../../CommandError';
import type { CursorDatabase } from '../../../database';
import { Subcommand, type SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { userOption } from '../../../lib/utils/builders';
import { Game } from '../Game';

export class PlaySubcommand extends Subcommand {
    public constructor(private readonly db: CursorDatabase) {
        super();
    }

    protected override definition(): SubcommandDefinition {
        return {
            name: 'play',
            description: 'Play Rock Paper Scissors',
            options: [
                userOption({
                    name: 'opponent',
                    description: 'Choose your opponent',
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const opponent = interaction.options.getUser('opponent', true);

        if (opponent.bot) {
            throw new CommandError('You cannot play against bots.');
        }

        if (opponent.id === interaction.user.id) {
            throw new CommandError('You cannot play against yourself.');
        }

        await new Game([interaction.user, opponent], this.db).start(interaction);
    }
}
