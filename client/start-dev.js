#!/usr/bin/env node

/**
 * This script helps fix the Node.js uv_cwd error by ensuring the correct working directory
 * is set before starting the development server.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the correct working directory
process.chdir(__dirname);
console.log(`Working directory set to: ${process.cwd()}`);

// Start the Vite development server
console.log('Starting Vite development server...');
const vite = spawn('npx', ['vite'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Force Node to use the current directory
    NODE_OPTIONS: '--experimental-modules --no-warnings'
  }
});

vite.on('error', (err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

vite.on('exit', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down...');
  vite.kill('SIGTERM');
});