import { createHandler } from '../lib/private-area.mjs';
export default request => createHandler(process.env)(request);
