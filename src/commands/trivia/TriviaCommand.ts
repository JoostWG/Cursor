import type { ChatInputCommandInteraction } from 'discord.js';
import {
    Category,
    QuestionDifficulties,
    QuestionEncodings,
    getQuestions,
    type CategoryNames,
    type QuestionOptions,
} from 'open-trivia-db';
import { SlashCommand } from '../../lib/core';
import { stringOption } from '../../lib/utils/builders';
import { QuestionView } from './QuestionView';

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

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
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
