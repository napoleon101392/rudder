import inquirer from 'inquirer';

const services = [
    { name: 'nginx', versions: ['latest', 'alpine'], params: ['port'] },
];

export function askToCreateDirectory(path) {
    return inquirer.prompt([
        {
            default: true,
            type: 'confirm',
            message: 'The does not exist. Do you want to create it?',
            name: 'createDirectory',
        },
    ]);
}

export function selectServices() {
    return inquirer.prompt([
        {
            type: 'checkbox',
            message: 'Select services',
            name: 'services',
            choices: services.map(service => service.name),
        },
    ]);
}

export function selectVersion(serviceName) {
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

export async function enterParams(serviceName) {
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

export function selectNetwork(serviceName, networks) {
    return inquirer.prompt([
        {
            type: 'list',
            message: `Select network for ${serviceName} (leave blank for none)`,
            name: 'network',
            choices: ['none', ...networks],
        },
    ]);
}

export async function selectDependsOn(serviceName, installedServices) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'dependsOn',
            message: `Select depends_on for ${serviceName} (leave blank for none)`,
            choices: ['none', ...installedServices],
        }
    ]);
}