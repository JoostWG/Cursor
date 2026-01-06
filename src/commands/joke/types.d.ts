import type { JokeCategory } from './JokeCategory';
import type { JokeLanguage } from './JokeLanguage';

export type JokeBlacklistFlag =
    | 'nsfw'
    | 'religious'
    | 'political'
    | 'racist'
    | 'sexist'
    | 'explicit';

export interface ErrorResponse extends Record<string, unknown> {
    error: true;
    internalError: boolean;
    code: number;
    message: string;
    causedBy: string[];
    additionalInfo: string;
    timestamp: number;
}

export interface SuccessResponse extends Record<string, unknown> {
    error: false;
}

export interface Joke extends Record<string, unknown> {
    category: JokeCategory;
    flags: Map<JokeBlacklistFlag, boolean>;
    id: number;
    safe: boolean;
    lang: JokeLanguage;
}

export interface SingleTypeJoke extends Joke {
    type: 'single';
    joke: string;
}

export interface TwopartTypeJoke extends Joke {
    type: 'twopart';
    setup: string;
    delivery: string;
}

export type SingleJokeResponse = SuccessResponse & (SingleTypeJoke | TwopartTypeJoke);

export type MultipleJokesResponse = SuccessResponse & {
    amount: number;
    jokes: (SingleTypeJoke | TwopartTypeJoke)[];
};

export type AnySuccessResponse = SingleJokeResponse | MultipleJokesResponse;
export type AnyResponse = ErrorResponse | AnySuccessResponse;
