import fs from 'fs';
import path from 'path';

export function copyIncFiles(serviceName) {
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

// Get the list of services from the .docker directory
export const getServices = (dockerDirectory) => {
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