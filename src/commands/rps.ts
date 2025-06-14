import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    Colors,
    ContainerBuilder,
    HeadingLevel,
    type Locale,
    MessageFlags,
    SeparatorBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption,
    TextDisplayBuilder,
    type User,
    bold,
    heading,
    userMention,
} from 'discord.js';
import i18next from 'i18next';
import { CommandError, SlashCommand } from '../core/command';
import type { Context } from '../core/context';
import type { CursorDatabase } from '../setup';
import { localize } from '../utils';

const emojis = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️',
} as const;

type Choice = keyof typeof emojis;

class Round {
    public choices: [Choice | null, Choice | null];
    public roundId?: number;

    public constructor() {
        this.choices = [null, null];
    }

    public get(index: number) {
        return this.choices[index];
    }

    public set(index: number, choice: Choice) {
        this.choices[index] = choice;
    }

    public isFinished(): this is 3 {
        return !this.choices.includes(null);
    }

    public getResult() {
        if (!this.choices[0] || !this.choices[1]) {
            return -1;
        }

        const keys = Object.keys(emojis);
        return (keys.indexOf(this.choices[0]) - keys.indexOf(this.choices[1])) % 3;
    }
}

class Game {
    private readonly users: [User, User];
    private readonly db: CursorDatabase;
    private readonly rounds: [Round, Round, Round];
    private currentRoundIndex: number;
    private readonly timeout: number;
    private locale?: Locale;
    private gameId?: number;
    private status:
        | 'invitePending'
        | 'inviteDenied'
        | 'inviteExpired'
        | 'gameActive'
        | 'gameFinished'
        | 'gameExpired';

    public constructor(users: [User, User], db: CursorDatabase, options?: { timeout?: number }) {
        this.users = users;
        this.db = db;
        this.timeout = options?.timeout ?? 60_000;
        this.rounds = [new Round(), new Round(), new Round()];
        this.currentRoundIndex = 0;
        this.status = 'invitePending';
    }

    private get player1() {
        return this.users[0];
    }

    private get player2() {
        return this.users[1];
    }

    public async start(interaction: ChatInputCommandInteraction) {
        this.locale = interaction.locale;
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
                components: [
                    new TextDisplayBuilder().setContent('Failed to start game: database issue'),
                ],
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
                        content: i18next.t('commands:rps.game.error.notPLayer', {
                            lng: buttonInteraction.locale,
                        }),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }

                const round = this.rounds[this.currentRoundIndex];

                if (round.get(userIndex) !== null) {
                    await buttonInteraction.reply({
                        content: i18next.t('commands:rps.game.error.alreadyChosen', {
                            lng: buttonInteraction.locale,
                        }),
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

    private buildComponents() {
        const builder = new ContainerBuilder();

        builder.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                heading(i18next.t('commands:rps.game.name', { lng: this.locale })),
            ),
        );

        switch (this.status) {
            case 'invitePending':
            case 'inviteDenied':
            case 'inviteExpired':
                switch (this.status) {
                    case 'invitePending':
                        builder.setAccentColor(Colors.Blue).addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                i18next.t('commands:rps.game.invitePending', {
                                    lng: this.locale,
                                    user: userMention(this.player1.id),
                                }),
                            ),
                        );
                        break;

                    case 'inviteDenied':
                        builder.setAccentColor(Colors.Red).addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                i18next.t('commands:rps.game.inviteDenied', {
                                    lng: this.locale,
                                }),
                            ),
                        );
                        break;

                    case 'inviteExpired':
                        builder.setAccentColor(Colors.Red).addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                i18next.t('commands:rps.game.inviteExpired', {
                                    lng: this.locale,
                                }),
                            ),
                        );
                        break;
                }

                builder.addActionRowComponents(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId('deny')
                            .setLabel(i18next.t('commands:rps.game.deny', { lng: this.locale }))
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(this.status !== 'invitePending'),
                        new ButtonBuilder()
                            .setCustomId('accept')
                            .setLabel(i18next.t('commands:rps.game.accept', { lng: this.locale }))
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(this.status !== 'invitePending'),
                    ),
                );
                break;

            case 'gameExpired':
            case 'gameActive':
            case 'gameFinished':
                builder
                    .setAccentColor(Colors.Gold)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            this.rounds
                                .map((round, roundIndex) => [
                                    heading(
                                        i18next.t('commands:rps.game.round', {
                                            lng: this.locale,
                                            round: roundIndex + 1,
                                        }),
                                        HeadingLevel.Three,
                                    ),
                                    ...round.choices.map((choice, choiceIndex) => {
                                        const choiceString = choice
                                            ? round.isFinished()
                                                ? emojis[choice]
                                                : '???'
                                            : roundIndex === this.currentRoundIndex
                                              ? `${i18next.t('commands:rps.game.waiting', {
                                                    lng: this.locale,
                                                })}...`
                                              : '...';

                                        return `${this.users[choiceIndex].displayName}: ${choiceString}`;
                                    }),
                                    [
                                        i18next.t('commands:rps.game.tie', {
                                            lng: this.locale,
                                        }),
                                        i18next.t('commands:rps.game.win', {
                                            lng: this.locale,
                                            user: this.player1.displayName,
                                        }),
                                        i18next.t('commands:rps.game.win', {
                                            lng: this.locale,
                                            user: this.player2.displayName,
                                        }),
                                    ][round.getResult()] ?? '',
                                ])
                                .flat()
                                .join('\n'),
                        ),
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                    .addActionRowComponents(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            ...Object.entries(emojis).map(([key, emoji]) =>
                                new ButtonBuilder()
                                    .setCustomId(key)
                                    .setLabel(emoji)
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(this.status !== 'gameActive'),
                            ),
                        ),
                    );
                break;
        }

        return [builder];
    }
}

export default class RockPaperScissorsCommand extends SlashCommand {
    public constructor(private readonly db: CursorDatabase) {
        super('rps');

        this.data
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('play')
                    .setDescription('Play')
                    .addUserOption(
                        localize(
                            SlashCommandUserOption,
                            'opponent',
                            'rps.options.opponent',
                        ).setRequired(true),
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder().setName('stats').setDescription('show stats'),
            );
    }

    public override async execute({ interaction }: Context<ChatInputCommandInteraction>) {
        switch (interaction.options.getSubcommand()) {
            case 'play':
                await this.play(interaction);
                break;

            case 'stats':
                await this.stats(interaction);
                break;
        }
    }

    private async play(interaction: ChatInputCommandInteraction) {
        const opponent = interaction.options.getUser('opponent', true);

        if (opponent.bot) {
            throw new CommandError(
                i18next.t('commands:rps.error.noBot', { lng: interaction.locale }),
            );
        }

        if (opponent.id === interaction.user.id) {
            throw new CommandError(
                i18next.t('commands:rps.error.noSelf', { lng: interaction.locale }),
            );
        }

        await new Game([interaction.user, opponent], this.db).start(interaction);
    }

    private async stats(interaction: ChatInputCommandInteraction) {
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
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        [
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
                    ),
                ),
            ],
        });
    }
}
