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
import { stringTitle } from '../../lib/utils';
import { actionRow, button, container, textDisplay } from '../../lib/utils/builders';
import { QuestionType, type AnyQuestionData } from '../../modules/trivia';
import type { Answer, Status } from './types';

export class QuestionView {
    private readonly answers: Map<string, Answer>;
    private status: Status;

    public constructor(private readonly question: AnyQuestionData) {
        // TODO: Below

        const allAnswers = this.question.type === QuestionType.Boolean
            ? ['True', 'False']
            : [this.question.correct_answer, ...this.question.incorrect_answers];

        this.answers = new Map(
            allAnswers.map((answer, index) => [
                index.toString(),
                {
                    value: answer,
                    id: index.toString(),
                    correct: question.correct_answer === answer,
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
                        content: heading(this.question.question, HeadingLevel.Three),
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
                            `${this.question.category} - ${
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
