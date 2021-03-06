interface ErrorType {
    statusCode: number,
    message: string
}

export default class HttpError {
    public status: number;
    public message: string;
    public stacktrace: any;
    public extra: any;
    public timestamp: Date;

    constructor(public name: string, type: ErrorType, originalError?: Error) {
        this.timestamp = new Date();
        this.message = type.message;
        this.status = type.statusCode;

        if (originalError && originalError.stack) {
            this.stacktrace = originalError.stack;
        } else {
            this.stacktrace = new Error().stack;
        }

        this.extra = originalError;
    }

    // AUTHENTICATION

    static AUTH_NO_PERMISSIONS: ErrorType = {
        statusCode: 401,
        message: "You have no permissions to access this route."
    };

    static INVALID_SESSION: ErrorType = {
        statusCode: 401,
        message: "The session has been invalidated or deleted. " +
                 "Please retrieve new token through login."
    };

    static EXPIRED_AUTH_TOKEN: ErrorType = {
        statusCode: 401,
        message: "The auth token has expired. Please retrieve new one through login."
    };

    static INVALID_AUTH_TOKEN: ErrorType = {
        statusCode: 401,
        message: "The auth token supplied was not valid."
    };

    static MISSING_AUTH_TOKEN: ErrorType = {
        statusCode: 401,
        message: "Unauthorized request. This resource requires authentication. " +
                 "Please provide an access token with your request as an Authorization header."
    };

    // REQUEST TOKEN

    static AUTH_INVALID_CREDENTIALS: ErrorType = {
        statusCode: 401,
        message: "Username and password didn't match."
    };

    // TOKEN REFRESH

    static INTERNAL_SERVER_ERROR: ErrorType = {
        statusCode: 500,
        message: "An unexpected error occurred"
    };
}