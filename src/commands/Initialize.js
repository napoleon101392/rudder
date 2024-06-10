import fs from 'fs';
import inquirer from 'inquirer';
import config from '../../config.js';
import yaml from 'js-yaml';

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

    const dockerComposeYaml = yaml.dump({
        version: config.dockerComposeVersion,
        services: null,
        networks: {
            [projectName]: {
                driver: 'bridge'
            }
        }
    });

    fs.writeFileSync(config.parentDockerComposeFile, dockerComposeYaml);
}

export default {
    init,
};