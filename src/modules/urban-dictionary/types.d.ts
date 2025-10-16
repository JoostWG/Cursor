export interface Definition {
    defid: number;
    word: string;
    definition: string;
    author: string;
    written_on: string;
    example: string;
    permalink: string;
    thumbs_up: number;
    thumbs_down: number;
    current_vote: string;
}

export type ResponseData<T> =
    | T
    | {
        error: string | number;
    };
