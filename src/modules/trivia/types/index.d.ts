import type { QuestionDifficulty, QuestionType } from '../enums';

export type * from './responses';

export interface QuestionOptions {
    amount: number;
    category?: number;
    difficulty?: QuestionDifficulty;
    type?: QuestionType;
    token?: string;
}
