import {Response, Request, NextFunction} from 'express';
import * as jwt from 'jwt-simple';

import config from '../../../config';
import HttpError from "../utils/HttpError";

const userMockdata = [
    {
        id: 1,
        username: "vili",
        password: "vili",
        role: "admin"
    },
    {
        id: 2,
        username: "erika",
        password: "erika",
        role: "user"
    }
];

const getUserById = id => {
    userMockdata.forEach(user => {
        if (user.id === id) {
            return user;
        }
    });

    return null;
};

// Generates authentication function for specific role
export const authenticate = (requiredRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.header("Authorization");

        if (!req.header("Authorization")) {
            throw new HttpError("auth_no_token", HttpError.MISSING_AUTH_TOKEN);
        }

        let payload;

        try {
            payload = jwt.decode(token, config.tokenSecret);
        } catch (err) {
            throw new Error();
        }

        const user = getUserById(payload.id);
    }
};

export const requestToken = (username: string, password: string) => {

};
