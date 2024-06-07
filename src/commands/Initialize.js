import fs from 'fs';
import inquirer from 'inquirer';
import config from '../../config.js';

async function init() {
    const { projectName } = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter project name',
            name: 'projectName',
            validate: function(input) {
                if (input === '') {
                    return 'Project name is required';
                }
                return true;
            },
        },
    ]);

    const dockerCompose = `
version: '3.8'
services:

networks:
  ${projectName}_network:
    driver: bridge
`;

    fs.writeFileSync(config.dockerServicesDestination + '/docker-compose.yml', dockerCompose);
}

export default {
    init,
};