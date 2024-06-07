import fs from 'fs';
import path from 'path';

// Default configuration
const defaultConfig = {
  dockerServicesDestination: '.docker',
  parentDockerComposeFile: 'docker-compose.yml'
};

// Path to the .rudder file
const configPath = path.join(process.cwd(), '.rudder');

// Load and parse the .rudder file
let userConfig = {};
try {
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    userConfig = JSON.parse(rawConfig);
  } else {
    console.warn('.rudder file not found. Using default configuration.');
  }
} catch (error) {
  console.error('Error reading or parsing .rudder file:', error);
}

// Merge defaultConfig with userConfig (userConfig properties will overwrite defaultConfig properties)
const config = { ...defaultConfig, ...userConfig };

export default config;