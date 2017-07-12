declare namespace Express {
    export interface Request {
        user?: any,
        role?: any
    }
}

interface TokenExpiryTime {
    value: number,
    unit: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"
}