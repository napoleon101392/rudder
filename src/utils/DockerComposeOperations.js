import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import chalk from 'chalk';

export function loadDockerCompose() {
    const dockerComposeYaml = fs.readFileSync('docker-compose.yml', 'utf8');
    return yaml.load(dockerComposeYaml);
}

export function updateDockerCompose(serviceName, dockerComposeContent, networkName, dependsOn) {
    const mainDockerCompose = loadDockerCompose();
    const serviceDockerCompose = {
        version: '3.8',
        services: {}
    };
    serviceDockerCompose.services[serviceName] = yaml.load(dockerComposeContent)[serviceName];

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

    // Add the depends_on field to the main Docker Compose file if dependsOn is truthy and has at least one element
    if (dependsOn && dependsOn.length > 0) {
        mainDockerCompose.services[serviceName].depends_on = [dependsOn];
        console.log(chalk.cyan(`Service ${serviceName} now depends on ${dependsOn}`));
    }

    // Add the networks field to the main Docker Compose file if network is truthy
    if (networkName && networkName !== 'none') {
        mainDockerCompose.services[serviceName].networks = [networkName];
        console.log(chalk.cyan(`Network ${networkName} added to the service ${serviceName}`));
    }

    fs.writeFileSync('docker-compose.yml', yaml.dump(mainDockerCompose, { indent: 2 }));
    console.log(chalk.cyan(`Main Docker Compose file updated with the service ${serviceName}`));
    console.log(chalk.cyan(`You can view the updated file here: vscode://file/${path.resolve('docker-compose.yml')}`));
}