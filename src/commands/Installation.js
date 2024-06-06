import { selectServices, selectVersion, enterParams, selectNetwork, selectDependsOn } from '../utils/ServicePrompts.js';
import { copyIncFiles, getServices } from '../utils/FileOperations.js';
import { renderTemplate } from '../utils/TemplateRendering.js';
import { loadDockerCompose, updateDockerCompose } from '../utils/DockerComposeOperations.js';

async function handleService(serviceName, networks) {
    const versionAnswer = await selectVersion(serviceName);
    const params = await enterParams(serviceName);
    const networkAnswer = await selectNetwork(serviceName, networks);
    const installedServices = await getServices('.docker');

    let dependsOnAnswer = { dependsOn: [] };
    if (installedServices.length > 0) {
        dependsOnAnswer = await selectDependsOn(serviceName, installedServices);
    }

    const dockerComposeContent = renderTemplate(serviceName, versionAnswer.version, params);
    updateDockerCompose(serviceName, dockerComposeContent, networkAnswer.network, dependsOnAnswer.dependsOn);
    copyIncFiles(serviceName);
}

async function install() {
    const dockerCompose = loadDockerCompose();
    const networks = Object.keys(dockerCompose.networks || {});
    const answers = await selectServices();

    const servicePromises = answers.services.map(serviceName => handleService(serviceName, networks));
    await Promise.all(servicePromises);
}

export default {
    install,
};
