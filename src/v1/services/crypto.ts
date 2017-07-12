/**
 * Created by vili on 25/06/2017.
 */

import * as bcrypt from "bcrypt-nodejs";
import HttpError from "../utils/HttpError";

export const hash = (plainTextPassword: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(plainTextPassword, null, null, (err, hash) => {
            if (err) {
                reject(new HttpError("internal_error", HttpError.INTERNAL_SERVER_ERROR, err));
            }

            resolve(hash);
        });
    });
};

export const compare = (plainTextPassword, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, hash, (err, result) => {
            if (err) {
                reject(new HttpError("internal_error", HttpError.INTERNAL_SERVER_ERROR, err));
            }

            resolve(result);
        });
    });
};