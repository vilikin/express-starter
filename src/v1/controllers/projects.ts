import * as express from 'express';
import projects from '../repositories/Project';
import {authenticate} from '../services/authentication';

const router = express.Router();

router.get("/", (req, res) => {
    res.json(projects.getAll());
});

router.post("/", authenticate, (req: express.Request, res: express.Response) => {
    projects.create(req.body);

    res.json({
        message: "Project created successfully"
    });
});

export default router;