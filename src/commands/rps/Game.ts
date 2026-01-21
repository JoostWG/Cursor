import {
    ButtonStyle,
    Colors,
    HeadingLevel,
    MessageFlags,
    heading,
    userMention,
    type APIBaseComponent,
    type ChatInputCommandInteraction,
    type ComponentType,
    type User,
} from 'discord.js';

import type { CursorDatabase } from '../../database';
import { actionRow, button, container, separator, textDisplay } from '../../lib/utils/builders';
import type { Choice } from './Choice';
import { emojis } from './emojis';
import { Round } from './Round';

export class Game {
    private readonly users: [User, User];
    private readonly db: CursorDatabase;
    private readonly rounds: [Round, Round, Round];
    private currentRoundIndex: number;
    private readonly timeout: number;
    private gameId?: number;
    private status:
        | 'invitePending'
        | 'inviteDenied'
        | 'inviteExpired'
        | 'gameActive'
        | 'gameFinished'
        | 'gameExpired';

    public constructor(options: { users: [User, User]; db: CursorDatabase; timeout?: number }) {
        this.users = options.users;
        this.db = options.db;
        this.timeout = options.timeout ?? 60_000;
        this.rounds = [new Round(), new Round(), new Round()];
        this.currentRoundIndex = 0;
        this.status = 'invitePending';
    }

    private get player1(): User {
        return this.users[0];
    }

    private get player2(): User {
        return this.users[1];
    }

    public async start(interaction: ChatInputCommandInteraction): Promise<void> {
        const response = await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: this.buildComponents(),
            withResponse: true,
        });

        if (!response.resource?.message) {
            await interaction.editReply({
                content: 'Something went wrong...',
                embeds: [],
                components: [],
            });

            return;
        }

        let inviteInteraction;

        try {
            inviteInteraction = await response.resource.message.awaitMessageComponent({
                time: this.timeout,
                filter: (i) => i.user.id === this.player2.id,
            });
        } catch {
            this.status = 'inviteExpired';
            await interaction.editReply({ components: this.buildComponents() });

            return;
        }

        switch (inviteInteraction.customId) {
            case 'accept':
                this.status = 'gameActive';
                await inviteInteraction.update({ components: this.buildComponents() });
                break;

            case 'deny':
                this.status = 'inviteDenied';
                await inviteInteraction.update({ components: this.buildComponents() });

                return;
        }

        try {
            await this.db.transaction().execute(async (transaction) => {
                const gameInsert = await transaction
                    .insertInto('rps_games')
                    .values({ user_id: interaction.user.id })
                    .executeTakeFirst();

                if (!gameInsert.insertId) {
                    throw new Error('No game insert id');
                }

                this.gameId = Number(gameInsert.insertId);

                await transaction
                    .insertInto('rps_game_user')
                    .values({ rps_game_id: this.gameId, user_id: this.player1.id })
                    .values({ rps_game_id: this.gameId, user_id: this.player2.id })
                    .execute();

                for (let i = 0; i < this.rounds.length; i++) {
                    const roundInsert = await transaction
                        .insertInto('rps_rounds')
                        .values({ rps_game_id: this.gameId, nr: i + 1 })
                        .executeTakeFirst();

                    if (!roundInsert.insertId) {
                        throw new Error('No round insert id');
                    }

                    this.rounds[i].roundId = Number(roundInsert.insertId);
                }
            });
        } catch (error) {
            console.error(error);

            await interaction.editReply({
                components: [textDisplay({ content: 'Failed to start game: database issue' })],
            });

            return;
        }

        response.resource.message
            .createMessageComponentCollector({
                time: this.timeout,
            })
            .on('collect', async (buttonInteraction) => {
                const userIndex = this.users
                    .map((user) => user.id)
                    .indexOf(buttonInteraction.user.id);

                if (userIndex === -1) {
                    await buttonInteraction.reply({
                        content: "This ain't your game!",
                        flags: MessageFlags.Ephemeral,
                    });

                    return;
                }

                const round = this.rounds[this.currentRoundIndex];

                if (round.get(userIndex) !== null) {
                    await buttonInteraction.reply({
                        content: 'You have already chosen this round. Waiting for opponent...',
                        flags: MessageFlags.Ephemeral,
                    });

                    return;
                }

                const choice = buttonInteraction.customId as Choice;

                round.set(userIndex, choice);

                if (round.roundId) {
                    await this.db
                        .insertInto('rps_choices')
                        .values({
                            rps_round_id: round.roundId,
                            user_id: this.users[userIndex].id,
                            choice,
                        })
                        .execute();
                }

                if (round.isFinished()) {
                    if (this.currentRoundIndex === 2) {
                        this.status = 'gameFinished';
                    } else {
                        this.currentRoundIndex++;
                    }
                }

                await buttonInteraction.update({ components: this.buildComponents() });
            });
    }

    private buildComponents(): APIBaseComponent<ComponentType>[] {
        const builder = container({
            components: [
                textDisplay({
                    content: heading('Rock Paper Scissors'),
                }),
            ],
        });

        switch (this.status) {
            case 'invitePending':
            case 'inviteDenied':
            case 'inviteExpired':
                switch (this.status) {
                    case 'invitePending':
                        builder.accent_color = Colors.Blue;

                        builder.components.push(
                            textDisplay({
                                content: [
                                    `${
                                        userMention(
                                            this.player1.id,
                                        )
                                    } has invited you to play Rock Paper Scissors`,
                                    'Please accept or deny within 60 seconds.',
                                ].join('\n'),
                            }),
                        );

                        break;

                    case 'inviteDenied':
                        builder.accent_color = Colors.Red;
                        builder.components.push(textDisplay({ content: 'Invite denied' }));
                        break;

                    case 'inviteExpired':
                        builder.accent_color = Colors.Red;
                        builder.components.push(textDisplay({ content: 'Invite expired' }));
                        break;
                }

                builder.components.push(
                    actionRow({
                        components: [
                            button({
                                style: ButtonStyle.Danger,
                                label: 'Deny',
                                custom_id: 'deny',
                                disabled: this.status !== 'invitePending',
                            }),
                            button({
                                style: ButtonStyle.Success,
                                label: 'Accept',
                                custom_id: 'accept',
                                disabled: this.status !== 'invitePending',
                            }),
                        ],
                    }),
                );

                break;

            case 'gameExpired':
            case 'gameActive':
            case 'gameFinished':
                builder.accent_color = Colors.Gold;

                builder.components = builder.components.concat([
                    textDisplay({
                        content: this.rounds
                            .map((round, roundIndex) => [
                                heading(`Round ${(roundIndex + 1).toString()}`, HeadingLevel.Three),
                                ...round.choices.map((choice, choiceIndex) => {
                                    const choiceString = choice
                                        ? round.isFinished()
                                            ? emojis[choice]
                                            : '???'
                                        : roundIndex === this.currentRoundIndex
                                        ? 'Waiting...'
                                        : '...';

                                    return `${
                                        this.users[choiceIndex].displayName
                                    }: ${choiceString}`;
                                }),
                                [
                                    'Tie',
                                    `${this.player1.displayName} wins!`,
                                    `${this.player2.displayName} wins!`,
                                ][round.getResult()] ?? '',
                            ])
                            .flat()
                            .join('\n'),
                    }),
                    separator({ divider: true }),
                    actionRow({
                        components: Object.entries(emojis).map(([key, emoji]) =>
                            button({
                                style: ButtonStyle.Primary,
                                label: emoji,
                                custom_id: key,
                                disabled: this.status !== 'gameActive',
                            })
                        ),
                    }),
                ]);

                break;
        }

        return [builder];
    }
}
