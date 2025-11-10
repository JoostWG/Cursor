import type { QuestionDifficulty, QuestionType } from './enums';
import type { TriviaApi } from './TriviaApi';
import type { AnyQuestionData, BooleanQuestionData, MultipleQuestionData } from './types';

export class Session {
    public constructor(protected readonly api: TriviaApi, public readonly token: string) {
        //
    }

    public async reset(): Promise<void> {
        await this.api.resetSessionToken(this.token);
    }

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type: QuestionType.Boolean;
    }): Promise<BooleanQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type: QuestionType.Multiple;
    }): Promise<MultipleQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type?: QuestionType;
    }): Promise<AnyQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type?: QuestionType;
    }): Promise<AnyQuestionData[]> {
        return await this.api.getQuestions({ ...options, token: this.token });
    }
}
