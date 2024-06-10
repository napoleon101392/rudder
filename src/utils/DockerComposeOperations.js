import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import chalk from 'chalk';
import config from '../../config.js';

export function loadDockerCompose() {
    const dockerComposeYaml = fs.readFileSync(config.parentDockerComposeFile, 'utf8');
    return yaml.load(dockerComposeYaml);
}

export function updateDockerCompose(serviceName, dockerComposeContent, networkName, dependsOn) {
    const mainDockerCompose = loadDockerCompose();
    const serviceDockerComposePath = createServiceDockerCompose(serviceName, dockerComposeContent);
    updateMainDockerCompose(serviceName, mainDockerCompose, serviceDockerComposePath, networkName, dependsOn);
    logUpdate(serviceName, serviceDockerComposePath);
}

function createServiceDockerCompose(serviceName, dockerComposeContent) {
    const serviceDockerCompose = {
        services: {}
    };
    serviceDockerCompose.services[serviceName] = yaml.load(dockerComposeContent)[serviceName];

    const serviceDockerComposePath = path.join(config.dockerServicesDestination, serviceName, 'docker-compose.yml');
    fs.mkdirSync(path.dirname(serviceDockerComposePath), { recursive: true });
    fs.writeFileSync(serviceDockerComposePath, yaml.dump(serviceDockerCompose, { indent: 2 }));

    return serviceDockerComposePath;
}

function updateMainDockerCompose(serviceName, mainDockerCompose, serviceDockerComposePath, networkName, dependsOn) {
    mainDockerCompose.services = mainDockerCompose.services || {};
    mainDockerCompose.services[serviceName] = {
        extends: {
            file: serviceDockerComposePath,
            service: serviceName
        }
    };

    if (dependsOn && dependsOn.length > 0) {
        mainDockerCompose.services[serviceName].depends_on = [dependsOn];
    }

    if (networkName && networkName !== 'none') {
        mainDockerCompose.services[serviceName].networks = [networkName];
    }

    fs.writeFileSync(config.parentDockerComposeFile, yaml.dump(mainDockerCompose, { indent: 2 }));
}

function logUpdate(serviceName, serviceDockerComposePath) {
    console.log(chalk.cyan(`Service Docker Compose file for ${serviceName} created at ${serviceDockerComposePath}`));
    console.log(chalk.cyan(`Main Docker Compose file updated with the service ${serviceName}`));
    console.log(chalk.cyan(`You can view the updated file here: vscode://file/${path.resolve(config.parentDockerComposeFile)}`));
}