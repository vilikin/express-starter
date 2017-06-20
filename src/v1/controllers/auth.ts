import * as express from 'express';
import { requestToken, refreshToken } from '../services/authentication';
import { Request, Response, NextFunction } from '@types/express';

const router = express.Router();

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await requestToken(req.body.username, req.body.password);

        res.json({
            token
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
