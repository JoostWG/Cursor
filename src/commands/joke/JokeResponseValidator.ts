import { v, type ObjectValidatorFunc, type ValidatorFunc } from 'valicheck';
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

export class JokeResponseValidator {
    public blacklistFlag(): ValidatorFunc<JokeBlacklistFlag> {
        return v.literal('nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit');
    }

    public successResponse(): ObjectValidatorFunc<SuccessResponse> {
        return v.object({
            error: v.literal(false),
        });
    }

    public joke(): ObjectValidatorFunc<Joke> {
        return v.object({
            category: v.string(),
            flags: v.objectMap(this.blacklistFlag(), v.boolean()),
            id: v.number(),
            safe: v.boolean(),
            lang: v.enumValue(JokeLanguage),
        });
    }

    public singleTypeJoke(): ObjectValidatorFunc<SingleTypeJoke> {
        return v.intersect(
            this.joke(),
            v.object({
                type: v.literal('single'),
                joke: v.string(),
            }),
        );
    }

    public twoPartTypeJoke(): ObjectValidatorFunc<TwopartTypeJoke> {
        return v.intersect(
            this.joke(),
            v.object({
                type: v.literal('twopart'),
                setup: v.string(),
                delivery: v.string(),
            }),
        );
    }

    public singleJokeResponse(): ValidatorFunc<SingleJokeResponse> {
        return v.anyOf(
            v.intersect(this.successResponse(), this.singleTypeJoke()),
            v.intersect(this.successResponse(), this.twoPartTypeJoke()),
        );
    }

    public multipleJokesResponse(): ValidatorFunc<MultipleJokesResponse> {
        return v.intersect(
            this.successResponse(),
            v.object({
                amount: v.number(),
                jokes: v.array(v.anyOf(this.singleTypeJoke(), this.twoPartTypeJoke())),
            }),
        );
    }

    public errorResponse(): ValidatorFunc<ErrorResponse> {
        return v.object({
            error: v.literal(true),
            internalError: v.boolean(),
            code: v.number(),
            message: v.string(),
            causedBy: v.array(v.string()),
            additionalInfo: v.string(),
            timestamp: v.number(),
        });
    }

    public anyResponse(): ValidatorFunc<AnyResponse> {
        return v.anyOf(
            this.singleJokeResponse(),
            this.multipleJokesResponse(),
            this.errorResponse(),
        );
    }
}
