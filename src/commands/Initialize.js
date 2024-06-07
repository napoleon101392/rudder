import fs from 'fs';
import inquirer from 'inquirer';
import config from '../../config.js';
import ejs from 'ejs';

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

    ejs.renderFile('./docker-compose.ejs', { projectName , version: config.dockerComposeVersion}, {}, function(err, str){
        if(err) {
            console.error(err);
        } else {
            fs.writeFileSync(config.parentDockerComposeFile, str);
        }
    });
}

export default {
    init,
};