import {Response, Request} from 'express';
import * as shortid from 'shortid';

import config from '../../../config';
import HttpError from "../utils/HttpError";

const persistError = (id: string, error: Object, req: Request) => {

    // We don't want to store non-hashed passwords anywhere, not even error logs
    if (req.body.password) {
        delete req.body.password;
    }

    let requestProperties = {
        path: req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body,
        headers: req.headers
    };

    // Placeholder implementation for error logging
    console.log("-------------------------------------------------");
    console.log("ERROR: " + id);
    console.log(error);
    console.log("Occurred with request", requestProperties);
    console.log("-------------------------------------------------");
};

const respondWithError = (id: string, err: HttpError, res: Response) => {
    res.status(err.status);
    res.json({
        status: err.status,
        error: {
            id: id,
            name: err.name,
            message: err.message,
            timestamp: err.timestamp,
            // Send stacktrace and extra info only in dev environment
            stacktrace: config.isDevelopment ? err.stacktrace : undefined,
            extra: config.isDevelopment() ? err.extra : undefined
        }
    });
};

const errorHandler = (err: Object, req: Request, res: Response, next) => {
    let id: string = shortid.generate();

    if (err instanceof Error) {
        let httpError = new HttpError("unexpected_error", HttpError.UNEXPECTED_SERVER_ERROR, err);
        respondWithError(id, httpError, res);
    } else if (err instanceof HttpError) {
        respondWithError(id, err, res);
    } else {
        // This should be unreachable
        let httpError = new HttpError("unexpected_error", HttpError.UNEXPECTED_SERVER_ERROR);
        respondWithError(id, httpError, res);
    }

    persistError(id, err, req);
};

export default errorHandler;