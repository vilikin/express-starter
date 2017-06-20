import {Response, Request, NextFunction} from 'express';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';

import config from '../../../config';
import HttpError from "../utils/HttpError";

const userMockdata = [
    {
        id: 1,
        username: "vili",
        password: "vili",
        role: "admin",
        allowTokenRefresh: true
    },
    {
        id: 2,
        username: "erika",
        password: "erika",
        role: "user",
        allowTokenRefresh: false
    }
];

let sessions = [
    {
        token: "23834thu4ewihuhu",
        user: 1,
        revoked: false
    }
];

const saveSession = async (token: string, user: number) => {
    sessions.push({
        token,
        user,
        revoked: false
    });
};

const updateSession = async (oldToken: string, newToken: string) => {
    sessions.forEach((session, index) => {
        if (session.token === oldToken) {
            sessions[index].token = newToken;
        }
    });
};

const isTokenRefreshAllowed = async token => {
    let refreshAllowed = false;

    sessions.forEach(session => {
        if (session.token === token && !session.revoked) {
            userMockdata.forEach(user => {
                if (user.id === session.user && user.allowTokenRefresh) {
                    refreshAllowed = true;
                }
            });
        }
    });

    return refreshAllowed;
};

const isTokenRevoked = async token => {
    let isRevoked = false;

    sessions.forEach(session => {
        if (session.token === token && session.revoked) {
            isRevoked = true;
        }
    });

    return isRevoked;
};

const getUserById = async id => {
    let matchingUser = null;

    userMockdata.forEach(user => {
        if (user.id === id) {
            matchingUser = user;
        }
    });

    return matchingUser;
};

const getUserWithCredentials = async (username: string, password: string) => {
    let matchingUser = null;

    userMockdata.forEach(user => {
        if (username === user.username && password === user.password) {
            matchingUser = user;
        }
    });

    return matchingUser;
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

        if (payload.expiry < moment().unix()) {
            return next(new HttpError("auth_expired_token", HttpError.EXPIRED_AUTH_TOKEN));
        } else {
            const revoked = await isTokenRevoked(token);

            if (revoked) {
                return next(new HttpError("auth_revoked_token", HttpError.REVOKED_AUTH_TOKEN));
            }
        }

        const user = await getUserById(payload.user);

        if (!user) {
            return next(new HttpError("auth_user_not_found", HttpError.INVALID_AUTH_TOKEN));
        }

        if (allowedRoles && allowedRoles.indexOf(user.role) === -1) {
            return next(new HttpError("auth_role_not_allowed_access", HttpError.AUTH_NO_PERMISSIONS));
        }

        if (allowedUsers && allowedUsers.indexOf(user.id) === -1) {
            return next(new HttpError("auth_user_not_allowed_access", HttpError.AUTH_NO_PERMISSIONS));
        }

        req.user = user;

        next();
    }
};

export const requestToken = async (username: string, password: string) => {
    const user = await getUserWithCredentials(username, password);

    if (!user) {
        throw new HttpError("auth_invalid_credentials", HttpError.AUTH_INVALID_CREDENTIALS);
    }

    const tokenContent = {
        user: user.id,
        expiry: moment().add(config.tokenExpiryTime.value, config.tokenExpiryTime.unit).unix()
    };

    const token = jwt.encode(tokenContent, config.tokenSecret);

    await saveSession(token, user.id);

    return token;
};

export const refreshToken = async token => {
    const allowed = await isTokenRefreshAllowed(token);

    if (!allowed) {
        throw new HttpError("auth_token_refresh_not_allowed", HttpError.AUTH_TOKEN_REFRESH_NOT_ALLOWED);
    }

    try {
        let payload = jwt.decode(token, config.tokenSecret);

        payload.expiry = moment().add(config.tokenExpiryTime.value, config.tokenExpiryTime.unit).unix();

        const newToken = jwt.encode(payload, config.tokenSecret);

        await updateSession(token, newToken);

        return newToken;
    } catch (err) {
        throw new HttpError("auth_invalid_token", HttpError.INVALID_AUTH_TOKEN);
    }
};
