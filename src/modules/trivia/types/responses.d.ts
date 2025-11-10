import type { QuestionDifficulty, QuestionType, ResponseCode } from '../enums';

export interface QuestionCount {
    total_num_of_questions: number;
    total_num_of_pending_questions: number;
    total_num_of_verified_questions: number;
    total_num_of_rejected_questions: number;
}

export interface Response {
    response_code: ResponseCode;
}

export interface RequestTokenResponse extends Response {
    response_message: string;
    token: string;
}

export interface ResetTokenResponse extends Response {
    token: string;
}

export interface GlobalCountResponse {
    overall: QuestionCount;
    categories: Record<`${number}`, QuestionCount>;
}

export interface CategoryData {
    id: number;
    name: string;
}

export interface CategoriesResponse {
    trivia_categories: CategoryData[];
}

export interface CategoryQuestionCountResponse {
    category_id: number;
    category_question_count: QuestionCount;
}

export interface QuestionData {
    type: QuestionType;
    difficulty: QuestionDifficulty;
    category: string;
    question: string;
}

export type BooleanQuestionData =
    & QuestionData
    & ({
        correct_answer: 'True';
        incorrect_answers: ['False'];
    } | {
        correct_answer: 'False';
        incorrect_answers: ['True'];
    });

export interface MultipleQuestionData extends QuestionData {
    correct_answer: string;
    incorrect_answers: [string, string, string];
}

export type AnyQuestionData = BooleanQuestionData | MultipleQuestionData;

export interface QuestionsResponse<T extends AnyQuestionData = AnyQuestionData> extends Response {
    results: T[];
}
