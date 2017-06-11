/**
 * Created by vilik on 11.6.2017.
 */

import {Response, Request, NextFunction} from 'express';
import HttpError from "../utils/HttpError";
import * as fs from 'fs';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Authenticate request
    fs.rename("/tmp/stuff", "/tmp/staff", (err) => {
        if (err) {
            next(new HttpError("auth.authenticate.stuffstaff", HttpError.AUTH_FAILED));
        } else {
            next();
        }
    });
};
