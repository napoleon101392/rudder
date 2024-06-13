import fs from 'fs';
import path from 'path';
import { askToCreateDirectory } from './ServicePrompts.js';
import config from '../../config.js';

export function copyIncFiles(serviceName) {
    const sourceDirectory = path.join('src', 'services', serviceName, 'inc');
    const destinationDirectory = path.join(config.dockerServicesDestination, serviceName);

    if (!fs.existsSync(sourceDirectory)) {
        console.log(`Skipping copying inc files for ${serviceName} as the directory does not exist`);
        return;
    }

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

// Get the list of services from the config.dockerServicesDestination directory
export const getServices = async (dockerDirectory) => {
    if (!fs.existsSync(dockerDirectory)) {
        const createDirectoryAnswer = await askToCreateDirectory(dockerDirectory);
        if (!createDirectoryAnswer.createDirectory) {
            console.log('Directory is required');
            return;
        }
    
        fs.mkdirSync(dockerDirectory, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        fs.readdir(dockerDirectory, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const services = files.filter(file => fs.statSync(path.join(dockerDirectory, file)).isDirectory());
                resolve(services);
            }
        });
    });
};