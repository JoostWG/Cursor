/**
 * The API appends a "Response Code" to each API Call to help tell developers what the API is doing.
 */
export enum ResponseCode {
    /**
     * Returned results successfully.
     */
    Success = 0,
    /**
     * Could not return results.
     * The API doesn't have enough questions for your query.
     * (Ex. Asking for 50 Questions in a Category that only has 20.
     */
    NoResults = 1,
    /**
     * Contains an invalid parameter. Arguments passed in aren't valid. (Ex. Amount = Five)
     */
    InvalidParameter = 2,
    /**
     * Session Token does not exist.
     */
    TokenNotFound = 3,
    /**
     * Session Token has returned all possible questions for the specified query.
     * Resetting the Token is necessary.
     */
    TokenEmpty = 4,
    /**
     * Too many requests have occurred. Each IP can only access the API once every 5 seconds.
     */
    RateLimit = 5,
}
