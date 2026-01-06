import { Validator, type ObjectValidatorFunc, type ValidatorFunc } from 'valicheck';
import { JokeCategory } from './JokeCategory';
import { JokeLanguage } from './JokeLanguage';
import type {
    AnyResponse,
    ErrorResponse,
    Joke,
    JokeBlacklistFlag,
    MultipleJokesResponse,
    SingleJokeResponse,
    SingleTypeJoke,
    SuccessResponse,
    TwopartTypeJoke,
} from './types';

export class JokeResponseValidator extends Validator {
    public blacklistFlag(): ValidatorFunc<JokeBlacklistFlag> {
        return this.literal('nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit');
    }

    public successResponse(): ObjectValidatorFunc<SuccessResponse> {
        return this.object({
            error: this.literal(false),
        });
    }

    public joke(): ObjectValidatorFunc<Joke> {
        return this.object({
            category: this.enum(JokeCategory),
            flags: this.objectMap(this.blacklistFlag(), this.boolean()),
            id: this.number(),
            safe: this.boolean(),
            lang: this.enum(JokeLanguage),
        });
    }

    public singleTypeJoke(): ObjectValidatorFunc<SingleTypeJoke> {
        return this.intersect(
            this.joke(),
            this.object({
                type: this.literal('single'),
                joke: this.string(),
            }),
        );
    }

    public twoPartTypeJoke(): ObjectValidatorFunc<TwopartTypeJoke> {
        return this.intersect(
            this.joke(),
            this.object({
                type: this.literal('twopart'),
                setup: this.string(),
                delivery: this.string(),
            }),
        );
    }

    public singleJokeResponse(): ValidatorFunc<SingleJokeResponse> {
        return this.anyOf([
            this.intersect(this.successResponse(), this.singleTypeJoke()),
            this.intersect(this.successResponse(), this.twoPartTypeJoke()),
        ]);
    }

    public multipleJokesResponse(): ValidatorFunc<MultipleJokesResponse> {
        return this.intersect(
            this.successResponse(),
            this.object({
                amount: this.number(),
                jokes: this.array(this.anyOf([this.singleTypeJoke(), this.twoPartTypeJoke()])),
            }),
        );
    }

    public errorResponse(): ValidatorFunc<ErrorResponse> {
        return this.object({
            error: this.literal(true),
            internalError: this.boolean(),
            code: this.number(),
            message: this.string(),
            causedBy: this.array(this.string()),
            additionalInfo: this.string(),
            timestamp: this.number(),
        });
    }

    public anyResponse(): ValidatorFunc<AnyResponse> {
        return this.anyOf([
            this.singleJokeResponse(),
            this.multipleJokesResponse(),
            this.errorResponse(),
        ]);
    }
}
