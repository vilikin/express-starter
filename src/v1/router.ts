import * as express from 'express';

import authController from './controllers/auth';

import projectsController from './controllers/projects';

import errorHandler from './services/error-handler';

const router = express.Router();

router.use("/projects", projectsController);
router.use("/auth", authController);

router.use(errorHandler);

export default router;
