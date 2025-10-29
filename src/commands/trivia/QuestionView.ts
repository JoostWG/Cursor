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
import { QuestionTypes, type Question } from 'open-trivia-db';
import { stringTitle } from '../../lib/utils';
import { actionRow, button, container, textDisplay } from '../../lib/utils/builders';
import type { Answer, Status } from './types';

export class QuestionView {
    private readonly question: Question;
    private readonly answers: Map<string, Answer>;
    private status: Status;

    public constructor(question: Question) {
        this.question = question;

        // TODO: Below
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        const allAnswers = this.question.type === QuestionTypes.Boolean
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
                                })
                            )
                            .toArray(),
                    }),
                    textDisplay({
                        content: subtext(
                            `${this.question.category.name} - ${
                                stringTitle(
                                    this.question.difficulty,
                                )
                            }`,
                        ),
                    }),
                ],
            }),
        ];
    }
}
