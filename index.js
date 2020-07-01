import { start } from './server';

start(process.env.API_PORT || 80);

export default start;
