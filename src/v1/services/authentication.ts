import { Response, Request, NextFunction } from 'express';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import { hash, compare } from './crypto';

import config from '../../../config';
import HttpError from "../utils/HttpError";

const TYPE_AUTH_TOKEN = "auth";
const TYPE_REFRESH_TOKEN = "refresh";

const users = [];

let sessions = [];

const initSession = async (user: number) => {

    const id = sessions.length;

    sessions.push({
        id,
        user,
        revoked: false
    });

    return id;
};

const updateSession = async (oldToken: string, newToken: string) => {

    for (let session of sessions) {
        if (session.token === oldToken) {
            session.token = newToken;
        }
    }
};

const getSession = async sessionId => {
    return sessions.find(session => session.id === sessionId);
};

const getUser = async id => {

    for (let user of users) {
        if (user.id === id) {
            return user;
        }
    }

    return null;
};

const getUserWithCredentials = async (username: string, password: string) => {

    for (let user of users) {
        if (username === user.username) {
            const match = await compare(password, user.password);

            if (match) {
                return user;
            }

            return null;
        }
    }

    return null;
};

// Generates authentication function for specific role
export const authenticate = (allowedRoles?: Array<string>, allowedUsers?: Array<number>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header("Authorization");

        if (!token) {
            return next(new HttpError("auth_no_token", HttpError.MISSING_AUTH_TOKEN));
        }

        let payload;

        try {
            payload = jwt.decode(token, config.tokenSecret);
        } catch (err) {
            return next(new HttpError("auth_invalid_token", HttpError.INVALID_AUTH_TOKEN));
        }

        if (payload.type !== TYPE_AUTH_TOKEN) {
            return next(new HttpError("auth_incorrect_token_type", HttpError.INVALID_AUTH_TOKEN));
        }

        if (payload.expiry < moment().unix()) {
            return next(new HttpError("auth_expired_token", HttpError.EXPIRED_AUTH_TOKEN));
        }

        if (allowedRoles && allowedRoles.indexOf(payload.role) === -1) {
            return next(new HttpError("auth_role_not_allowed_access", HttpError.AUTH_NO_PERMISSIONS));
        }

        if (allowedUsers && allowedUsers.indexOf(payload.user) === -1) {
            return next(new HttpError("auth_user_not_allowed_access", HttpError.AUTH_NO_PERMISSIONS));
        }

        req.user = payload.user;
        req.role = payload.role;

        next();
    }
};

export const requestToken = async (username: string, password: string, generateRefreshToken: boolean) => {
    const user = await getUserWithCredentials(username, password);

    if (!user) {
        throw new HttpError("auth_invalid_credentials", HttpError.AUTH_INVALID_CREDENTIALS);
    }

    const sessionId = await initSession(user.id);

    const tokenContent = {
        type: TYPE_AUTH_TOKEN,
        session: sessionId,
        user: user.id,
        role: user.role,
        expiry: moment().add(config.tokenExpiryTime.value, config.tokenExpiryTime.unit).unix()
    };

    const authToken = jwt.encode(tokenContent, config.tokenSecret);

    let refreshToken;

    if (generateRefreshToken) {
        const refreshTokenContent = {
            type: TYPE_REFRESH_TOKEN,
            session: sessionId
        };

        refreshToken = jwt.encode(refreshTokenContent, config.tokenSecret);
    }

    return {
        authToken,
        refreshToken
    };
};

export const refreshToken = async token => {
    let payload;

    try {
        payload = jwt.decode(token, config.tokenSecret);
    } catch (err) {
        throw new HttpError("auth_invalid_token", HttpError.INVALID_AUTH_TOKEN);
    }

    if (payload.type === TYPE_AUTH_TOKEN) {
        if (payload.expiry < moment().unix()) {
            throw new HttpError("auth_expired_token", HttpError.EXPIRED_AUTH_TOKEN);
        }
    }

    const session = await getSession(payload.session);

    if (!session) {
        throw new HttpError("auth_session_not_found", HttpError.INVALID_SESSION);
    }

    if (session.revoked) {
        throw new HttpError("auth_session_revoked", HttpError.INVALID_SESSION);
    }

    const user = await getUser(session.user);

    if (!user) {
        throw new HttpError("auth_user_not_found", HttpError.INVALID_AUTH_TOKEN);
    }

    payload.expiry = moment().add(config.tokenExpiryTime.value, config.tokenExpiryTime.unit).unix();
    payload.role = user.role;

    const newToken = jwt.encode(payload, config.tokenSecret);

    await updateSession(token, newToken);

    return newToken;
};

export const createUser = async user => {
    user.password = await hash(user.password);

    user.id = users.length;
    user.role = "user";

    users.push(user);
};