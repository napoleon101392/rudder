#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync } from 'fs';
import Initialize from './src/commands/Initialize.js';
import Installation from './src/commands/Installation.js';
import config from './config.js';

const program = new Command();

program
  .command('init')
  .description('Initialize the application')
  .action(async () => {
    await Initialize.init();
  });

program
  .command('install')
  .description('Install the application')
  .action(async () => {
    if (!existsSync(config.parentDockerComposeFile)) {
      console.log('Please execute "node drift init" first.');
      return;
    }
    await Installation.install();
  });

// If no arguments were provided, output help information
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
