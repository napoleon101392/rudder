import { selectServices, selectTag, enterParams, selectNetwork, selectDependsOn } from '../utils/ServicePrompts.js';
import { copyIncFiles, getServices } from '../utils/FileOperations.js';
import { renderTemplate } from '../utils/TemplateRendering.js';
import { loadDockerCompose, updateDockerCompose } from '../utils/DockerComposeOperations.js';
import config from '../../config.js';

async function handleService(serviceName, networks) {
    const tagAnswer = await selectTag(serviceName);
    const params = await enterParams(serviceName);
    const networkAnswer = await selectNetwork(serviceName, networks);
    const installedServices = await getServices(config.dockerServicesDestination);

    let dependsOnAnswer = { dependsOn: [] };
    if (installedServices.length > 0) {
        dependsOnAnswer = await selectDependsOn(serviceName, installedServices);
    }

    const dockerComposeContent = renderTemplate(serviceName, tagAnswer.imageTag, params);
    updateDockerCompose(serviceName, dockerComposeContent, networkAnswer.network, dependsOnAnswer.dependsOn);
    copyIncFiles(serviceName);
}

async function install() {
    const dockerCompose = loadDockerCompose();
    const networks = Object.keys(dockerCompose.networks || {});
    const docker = await selectServices();

    const servicePromise = handleService(docker.services, networks);
    await Promise.all([servicePromise]);
}

export default {
    install,
};
