import { localize } from '../utils';
import { BaseCommand } from '../utils/command';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    ContainerBuilder,
    HeadingLevel,
    Locale,
    MessageFlags,
    SeparatorBuilder,
    SlashCommandUserOption,
    TextDisplayBuilder,
    User,
    heading,
    userMention,
} from 'discord.js';
import i18next from 'i18next';

const emojis = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️',
} as const;

type Choice = keyof typeof emojis;

class Round {
    public choices: [Choice | null, Choice | null];

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
    private users: [User, User];
    private rounds: [Round, Round, Round];
    private currentRoundIndex: number;
    private timeout: number;
    private locale?: Locale;

    private status:
        | 'invitePending'
        | 'inviteDenied'
        | 'inviteExpired'
        | 'gameActive'
        | 'gameFinished'
        | 'gameExpired';

    public constructor(users: [User, User], options?: { timeout?: number }) {
        this.users = users;
        this.timeout = options?.timeout ?? 60_000;
        this.rounds = [new Round(), new Round(), new Round()];
        this.currentRoundIndex = 0;
        this.status = 'invitePending';
    }

    public async start(interaction: ChatInputCommandInteraction) {
        this.locale = interaction.locale;
        const response = await interaction.reply({
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

        switch (inviteInteraction?.customId) {
            case 'accept':
                this.status = 'gameActive';
                await inviteInteraction.update({ components: this.buildComponents() });
                break;

            case 'deny':
                this.status = 'inviteDenied';
                await inviteInteraction.update({ components: this.buildComponents() });
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

                if (this.rounds[this.currentRoundIndex].get(userIndex) !== null) {
                    await buttonInteraction.reply({
                        content: i18next.t('commands:rps.game.error.alreadyChosen', {
                            lng: buttonInteraction.locale,
                        }),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                this.rounds[this.currentRoundIndex].set(
                    userIndex,
                    buttonInteraction.customId as Choice,
                );

                if (this.rounds[this.currentRoundIndex].isFinished()) {
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
                                .map((round, roundIndex) => {
                                    return [
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
                                                  ? i18next.t('commands:rps.game.waiting', {
                                                        lng: this.locale,
                                                    }) + '...'
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
                                    ];
                                })
                                .flat()
                                .join('\n'),
                        ),
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                    .addActionRowComponents(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            ...Object.entries(emojis).map(([key, emoji]) => {
                                return new ButtonBuilder()
                                    .setCustomId(key)
                                    .setLabel(emoji)
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(this.status !== 'gameActive');
                            }),
                        ),
                    );
        }

        return [builder];
    }

    private get player1() {
        return this.users[0];
    }

    private get player2() {
        return this.users[1];
    }
}

export default class RockPaperScissorsCommand extends BaseCommand {
    public constructor() {
        super('rps');

        this.data.addUserOption(
            localize(SlashCommandUserOption, 'opponent', 'rps.options.opponent').setRequired(true),
        );
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        const opponent = interaction.options.getUser('opponent', true);

        if (opponent.bot) {
            await interaction.reply({
                content: i18next.t('commands:rps.error.noBot', { lng: interaction.locale }),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (opponent.id === interaction.user.id) {
            await interaction.reply({
                content: i18next.t('commands:rps.error.noSelf', { lng: interaction.locale }),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await new Game([interaction.user, opponent]).start(interaction);
    }
}
