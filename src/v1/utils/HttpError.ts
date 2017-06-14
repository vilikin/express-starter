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

    static MISSING_AUTH_TOKEN: ErrorType = {
        statusCode: 401,
        message: "Unauthorized request. This resource requires authentication. " +
        "Please provide an access token with your request as Authorization header."
    };

    static UNEXPECTED_SERVER_ERROR: ErrorType = {
        statusCode: 500,
        message: "An unexpected error occurred"
    };
}