#!/usr/bin/env node

/**
 * Database Setup Script for FileFlowPro
 *
 * This script helps you set up the database for the application.
 * Run this after setting up your DATABASE_URL in the .env file.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 FileFlowPro Database Setup');
console.log('==============================\n');

// Check if .env file exists and has DATABASE_URL
try {
  const envContent = readFileSync('.env', 'utf-8');
  if (!envContent.includes('DATABASE_URL=') || envContent.includes('your-neon-connection-string-here')) {
    console.log('❌ Please set up your DATABASE_URL in the .env file first.');
    console.log('   1. Go to https://neon.tech');
    console.log('   2. Create a free account');
    console.log('   3. Create a new project');
    console.log('   4. Copy the connection string');
    console.log('   5. Replace the DATABASE_URL in .env file\n');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found in .env file');

  // Run database migration
  console.log('📦 Running database migration...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });

  console.log('✅ Database setup complete!');
  console.log('🎉 You can now run the application with: npm run dev');

} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('❌ .env file not found. Please create one with DATABASE_URL.');
  } else {
    console.log('❌ Error setting up database:', error.message);
  }
  process.exit(1);
}