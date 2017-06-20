declare namespace Express {
    export interface Request {
        user?: any
    }
}

interface TokenExpiryTime {
    value: number,
    unit: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"
}