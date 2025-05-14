import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    ContainerBuilder,
    HeadingLevel,
    MessageFlags,
    SlashCommandStringOption,
    TextDisplayBuilder,
    heading,
    subtext,
} from 'discord.js';
import type { CategoryNames, Question, QuestionOptions } from 'open-trivia-db';
import {
    Category,
    QuestionDifficulties,
    QuestionEncodings,
    QuestionTypes,
    getQuestions,
} from 'open-trivia-db';
import { stringTitle } from '../utils';
import { SlashCommand } from '../utils/command';

type Status = 'active' | 'finished';

interface Answer {
    readonly value: string;
    readonly id: string;
    readonly correct: boolean;
    revealed: boolean;
}

class QuestionView {
    private readonly question: Question;
    private readonly answers: Map<string, Answer>;
    private status: Status;

    public constructor(question: Question) {
        this.question = question;

        const allAnswers =
            this.question.type === QuestionTypes.Boolean
                ? ['True', 'False']
                : this.question.allAnswers;

        this.answers = new Map(
            allAnswers.map((answer, index) => [
                index.toString(),
                {
                    value: answer,
                    id: index.toString(),
                    correct: question.checkAnswer(answer),
                    revealed: false,
                },
            ]),
        );

        this.status = 'active';
    }

    public async start(interaction: ChatInputCommandInteraction) {
        const response = await interaction.reply({
            withResponse: true,
            flags: MessageFlags.IsComponentsV2,
            components: this.buildComponents(),
        });

        if (!response.resource?.message) {
            return;
        }

        response.resource.message
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000,
                filter: (i) => i.user.id === interaction.user.id,
            })
            .on('collect', async (buttonInteraction) => {
                const answer = this.answers.get(buttonInteraction.customId);

                if (!answer) {
                    return;
                }

                answer.revealed = true;

                if (answer.correct) {
                    this.status = 'finished';
                }

                await buttonInteraction.update({
                    components: this.buildComponents(),
                });
            })
            .on('end', async () => {
                this.status = 'finished';

                await interaction.editReply({ components: this.buildComponents() });
            });
    }

    private buildComponents() {
        return [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        heading(this.question.value, HeadingLevel.Three),
                    ),
                )
                .addActionRowComponents(
                    this.answers
                        .values()
                        .map((answer) =>
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setStyle(
                                        answer.revealed
                                            ? answer.correct
                                                ? ButtonStyle.Success
                                                : ButtonStyle.Danger
                                            : ButtonStyle.Secondary,
                                    )
                                    .setLabel(answer.value)
                                    .setCustomId(answer.id)
                                    .setDisabled(answer.revealed || this.status === 'finished'),
                            ),
                        )
                        .toArray(),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        subtext(
                            `${this.question.category.name} - ${stringTitle(this.question.difficulty)}`,
                        ),
                    ),
                ),
        ];
    }
}

export default class TriviaCommand extends SlashCommand {
    public constructor() {
        super('trivia');

        this.devOnly = true;

        this.data
            .setDescription('Test your knowledge!')
            .addStringOption(
                new SlashCommandStringOption()
                    .setName('category')
                    .setDescription('Choose a category')
                    .setChoices(
                        Category.allNames.map((name) => ({
                            name,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            value: Category.idByName(name)!.toString(),
                        })),
                    ),
            )
            .addStringOption(
                new SlashCommandStringOption()
                    .setName('difficulty')
                    .setDescription('Choose difficulty')
                    .addChoices(
                        Object.entries(QuestionDifficulties).map(([name, value]) => ({
                            name,
                            value,
                        })),
                    ),
            );
    }

    public async execute(interaction: ChatInputCommandInteraction) {
        const difficulty = interaction.options.getString('difficulty');
        const category = interaction.options.getString('category');

        const options: Partial<QuestionOptions> = {
            amount: 1,
            encode: QuestionEncodings.None,
            type: 'boolean',
        };

        if (difficulty) {
            options.difficulty = difficulty as QuestionDifficulties;
        }

        if (category) {
            options.category = Number(category) as CategoryNames;
        }

        const questions = await getQuestions(options);

        if (!questions.length) {
            return;
        }

        await new QuestionView(questions[0]).start(interaction);
    }
}
