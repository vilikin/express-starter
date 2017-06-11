import * as express from 'express';

import projectsController from './controllers/projects';
import errorHandler from './services/error-handler';

const router = express.Router();

router.use("/projects", projectsController);

router.use(errorHandler);

export default router;
