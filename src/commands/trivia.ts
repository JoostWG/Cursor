import {
    ButtonStyle,
    ComponentType,
    HeadingLevel,
    MessageFlags,
    heading,
    subtext,
    type APIBaseComponent,
    type ChatInputCommandInteraction,
} from 'discord.js';
import {
    Category,
    QuestionDifficulties,
    QuestionEncodings,
    QuestionTypes,
    getQuestions,
    type CategoryNames,
    type Question,
    type QuestionOptions,
} from 'open-trivia-db';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import { stringTitle } from '../utils';
import { actionRow, button, container, stringOption, textDisplay } from '../utils/builders';

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

    public async start(interaction: ChatInputCommandInteraction): Promise<void> {
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

    private buildComponents(): APIBaseComponent<ComponentType>[] {
        return [
            container({
                components: [
                    textDisplay({
                        content: heading(this.question.value, HeadingLevel.Three),
                    }),
                    actionRow({
                        components: this.answers
                            .values()
                            .map((answer) =>
                                button({
                                    style: answer.revealed
                                        ? answer.correct
                                            ? ButtonStyle.Success
                                            : ButtonStyle.Danger
                                        : ButtonStyle.Secondary,
                                    label: answer.value,
                                    custom_id: answer.id,
                                    disabled: answer.revealed || this.status === 'finished',
                                }),
                            )
                            .toArray(),
                    }),
                    textDisplay({
                        content: subtext(
                            `${this.question.category.name} - ${stringTitle(
                                this.question.difficulty,
                            )}`,
                        ),
                    }),
                ],
            }),
        ];
    }
}

export class TriviaCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'trivia',
            description: 'Test your knowledge!',
            options: [
                stringOption({
                    name: 'category',
                    description: 'Choose a category',
                    choices: Category.allNames.map((name) => ({
                        name,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value: Category.idByName(name)!.toString(),
                    })),
                }),
                stringOption({
                    name: 'difficulty',
                    description: 'Choose difficulty',
                    choices: Object.entries(QuestionDifficulties).map(([name, value]) => ({
                        name,
                        value,
                    })),
                }),
            ],
        });
    }

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
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
