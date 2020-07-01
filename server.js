import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import Crash from './routes';

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(helmet());
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(morgan('dev'));

const { CrashRouter } = Crash;
app.use('/api/crash', CrashRouter);

const start = async (port) => {
  try {
    app.listen(port);
  } catch (err) {
    return err;
  }
};

export { app, start };
