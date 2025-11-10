import axios, { type AxiosInstance } from 'axios';
import type { QuestionDifficulty, QuestionType } from './enums';
import { Session } from './Session';
import type {
    AnyQuestionData,
    BooleanQuestionData,
    CategoriesResponse,
    CategoryData,
    MultipleQuestionData,
    QuestionsResponse,
    RequestTokenResponse,
    ResetTokenResponse,
} from './types';

export interface Endpoints {
    api_token:
        | {
            params: { command: 'request' };
            returns: RequestTokenResponse;
        }
        | {
            params: { command: 'reset'; token: string };
            returns: ResetTokenResponse;
        };
}

export class TriviaApi {
    protected readonly axios: AxiosInstance;

    public constructor() {
        this.axios = axios.create({
            baseURL: 'https://opentdb.com',
        });
    }

    // Endpoints

    public async retrieveSessionToken(): Promise<string> {
        return await this.get<RequestTokenResponse>('api_token', { command: 'request' })
            .then(data => data.token);
    }

    public async resetSessionToken(token: string): Promise<void> {
        await this.get('api_token', { command: 'reset', token });
    }

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        token?: string;
    }): Promise<AnyQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type: QuestionType.Boolean;
        token?: string;
    }): Promise<BooleanQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type: QuestionType.Multiple;
        token?: string;
    }): Promise<MultipleQuestionData[]>;

    public async getQuestions(options: {
        amount: number;
        category?: number;
        difficulty?: QuestionDifficulty;
        type?: QuestionType;
        token?: string;
    }): Promise<AnyQuestionData[]> {
        return await this.get<QuestionsResponse>('api', options)
            .then((data) => data.results);
    }

    public async getAllCategories(): Promise<CategoryData[]> {
        return await this.get<CategoriesResponse>('api_categories')
            .then(data => data.trivia_categories);
    }

    // Other

    public async startSession(): Promise<Session> {
        return new Session(this, await this.retrieveSessionToken());
    }

    protected async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        return await this.axios.get<T>(`/${path}.php`, { params })
            .then((response) => response.data);
    }
}
