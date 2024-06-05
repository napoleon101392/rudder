import inquirer from 'inquirer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import chalk from 'chalk';

const services = [
    { name: 'nginx', versions: ['latest', 'alpine'], params: ['port'] },
];

function loadDockerCompose() {
    const dockerComposeYaml = fs.readFileSync('docker-compose.yml', 'utf8');
    return yaml.load(dockerComposeYaml);
}

function selectServices() {
    return inquirer.prompt([
        {
            type: 'checkbox',
            message: 'Select services',
            name: 'services',
            choices: services.map(service => service.name),
        },
    ]);
}

function selectVersion(serviceName) {
    const service = services.find(service => service.name === serviceName);
    return inquirer.prompt([
        {
            type: 'list',
            message: `Select version for ${serviceName}`,
            name: 'version',
            choices: service.versions,
        },
    ]);
}

async function enterParams(serviceName) {
    const service = services.find(service => service.name === serviceName);
    const params = {};

    for (const param of service.params) {
        const paramAnswer = await inquirer.prompt([
            {
                type: 'input',
                message: `Enter ${param} for ${serviceName}`,
                name: 'value',
            },
        ]);
        params[param] = paramAnswer.value;
    }

    return params;
}

function selectNetwork(serviceName, networks) {
    return inquirer.prompt([
        {
            type: 'list',
            message: `Select network for ${serviceName} (leave blank for none)`,
            name: 'network',
            choices: ['none', ...networks],
        },
    ]);
}

async function selectDependsOn(serviceName, installedServices) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'dependsOn',
            message: `Select depends_on for ${serviceName} (leave blank for none)`,
            choices: ['none', ...installedServices],
        }
    ]);
}

function renderTemplate(serviceName, version, params) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const templatePath = path.join(__dirname, '..', 'services', serviceName, 'template.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    return ejs.render(template, { name: serviceName, version, params });
}

function updateDockerCompose(serviceName, dockerComposeContent, networkName, dependsOn) {
    const mainDockerCompose = loadDockerCompose();
    const serviceDockerCompose = {
        version: '3.8',
        services: {}
    };
    serviceDockerCompose.services[serviceName] = yaml.load(dockerComposeContent)[serviceName];
    if (networkName && networkName !== 'none') {
        serviceDockerCompose.services[serviceName].networks = [networkName];
        console.log(chalk.cyan(`Network ${networkName} added to the service ${serviceName}`));
    }

    if (dependsOn && dependsOn !== 'none' && dependsOn !== serviceName) {
        serviceDockerCompose.services[serviceName].depends_on = [dependsOn];
        console.log(chalk.cyan(`Service ${serviceName} now depends on ${dependsOn}`));
    }

    const serviceDockerComposePath = path.join('.docker', serviceName, 'docker-compose.yml');
    fs.mkdirSync(path.dirname(serviceDockerComposePath), { recursive: true });
    fs.writeFileSync(serviceDockerComposePath, yaml.dump(serviceDockerCompose, { indent: 2 }));
    console.log(chalk.cyan(`Service Docker Compose file for ${serviceName} created at ${serviceDockerComposePath}`));

    mainDockerCompose.services = mainDockerCompose.services || {};
    mainDockerCompose.services[serviceName] = {
        extends: {
            file: serviceDockerComposePath,
            service: serviceName
        }
    };

    fs.writeFileSync('docker-compose.yml', yaml.dump(mainDockerCompose, { indent: 2 }));
    console.log(chalk.cyan(`Main Docker Compose file updated with the service ${serviceName}`));
    console.log(chalk.cyan(`You can view the updated file here: vscode://file/${path.resolve('docker-compose.yml')}`));
}

// Get the list of services from the .docker directory
const getServices = (dockerDirectory) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dockerDirectory, (err, files) => {
            if (err) {
                reject(err);
            } else {
                // Filter out non-directory files
                const services = files.filter(file => fs.statSync(path.join(dockerDirectory, file)).isDirectory());
                resolve(services);
            }
        });
    });
};

function copyIncFiles(serviceName) {
    const sourceDirectory = path.join('src', 'services', serviceName, 'inc');
    const destinationDirectory = path.join('.docker', serviceName);

    fs.readdir(sourceDirectory, (err, files) => {
        if (err) {
            console.error(`Failed to read directory: ${sourceDirectory}`);
            return;
        }

        files.forEach(file => {
            const sourceFile = path.join(sourceDirectory, file);
            const destinationFile = path.join(destinationDirectory, file);

            fs.copyFile(sourceFile, destinationFile, err => {
                if (err) {
                    console.error(`Failed to copy file: ${sourceFile}`);
                } else {
                    console.log(`Copied file: ${sourceFile} to ${destinationFile}`);
                }
            });
        });
    });
}

async function handleService(serviceName, networks) {
    const versionAnswer = await selectVersion(serviceName);
    const params = await enterParams(serviceName);
    const networkAnswer = await selectNetwork(serviceName, networks);
    const installedServices = await getServices('.docker');
    const dependsOnAnswer = await selectDependsOn(serviceName, installedServices);

    const dockerComposeContent = renderTemplate(serviceName, versionAnswer.version, params);
    updateDockerCompose(serviceName, dockerComposeContent, networkAnswer.network, dependsOnAnswer.dependsOn);
    copyIncFiles(serviceName);
}

async function install() {
    const dockerCompose = loadDockerCompose();
    const networks = Object.keys(dockerCompose.networks || {});
    const services = Object.keys(dockerCompose.services || {});
    const answers = await selectServices();

    const servicePromises = answers.services.map(serviceName => handleService(serviceName, networks));
    await Promise.all(servicePromises);
}

export default {
    install,
};
