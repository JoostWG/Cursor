import type { RESTPostAPIChatInputApplicationCommandsJSONBody, User } from 'discord.js';
import { SlashCommand } from '../../lib/core';
import type { ChatInputContext } from '../../lib/core/context';
import type { OmitType } from '../../lib/utils';
import { stringOption } from '../../lib/utils/builders';
import {
    QuestionDifficulty,
    TriviaApi,
    type QuestionOptions,
    type Session,
} from '../../modules/trivia';
import { categories } from './categories';
import { QuestionView } from './QuestionView';

export class TriviaCommand extends SlashCommand {
    private readonly api: TriviaApi;
    private readonly sessions: Map<string, Session>;

    public constructor() {
        super();

        this.devOnly = true;
        this.api = new TriviaApi();
        this.sessions = new Map();
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'trivia',
            description: 'Test your knowledge!',
            options: [
                stringOption({
                    name: 'category',
                    description: 'Choose a category',
                    choices: categories.map(({ name, id }) => ({ name, value: id.toString() })),
                }),
                stringOption({
                    name: 'difficulty',
                    description: 'Choose difficulty',
                    choices: Object.entries(QuestionDifficulty).map(([name, value]) => ({
                        name,
                        value,
                    })),
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const difficulty = interaction.options.getString('difficulty') as QuestionDifficulty | null;
        const category = interaction.options.getString('category');

        const session = await this.getSession(interaction.user);

        const options: QuestionOptions = {
            amount: 1,
        };

        if (difficulty) {
            options.difficulty = difficulty;
        }

        if (category) {
            options.category = Number(category);
        }

        const questions = await session.getQuestions(options);

        if (!questions.length) {
            return;
        }

        await new QuestionView(questions[0]).start(interaction);
    }

    private async getSession(user: User): Promise<Session> {
        if (this.sessions.has(user.id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.sessions.get(user.id)!;
        }

        const session = await this.api.startSession();

        this.sessions.set(user.id, session);

        return session;
    }
}
