// Import environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';

import config from '../config';

import router from './v1/router';

const app = express();

app.use(bodyParser.json());
app.use(morgan(config.isDevelopment ? 'dev' : 'tiny'));
app.use("/api/v1/", router);

app.listen(config.port, () => console.log("App started on port " + config.port));