import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function renderTemplate(serviceName, version, params) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const templatePath = path.join(__dirname, '..', 'services', serviceName, 'template.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    return ejs.render(template, { name: serviceName, version, params });
}