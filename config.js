import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.rudder'), 'utf-8'));

export default config;