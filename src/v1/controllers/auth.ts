import * as express from 'express';
import {requestToken, refreshToken, createUser} from '../services/authentication';
import { Request, Response, NextFunction } from '@types/express';

const router = express.Router();

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tokens = await requestToken(req.body.username, req.body.password, true);

        res.json(tokens);
    } catch (err) {
        next(err);
    }
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createUser(req.body);

        res.json({
            message: "ok"
        });
    } catch (err) {
        next(err);
    }
});

router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await refreshToken(req.body.token);

        res.json({
            token
        });
    } catch (err) {
        next(err);
    }
});


export default router;
