#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DEPLOYMENT_URL = process.argv[2] || 'http://localhost:3000';
const INIT_SECRET = process.env.INIT_SECRET || 'your-init-secret-for-production';

async function initializeDatabase() {
  console.log(`Initializing database at ${DEPLOYMENT_URL}...`);
  
  try {
    const response = await fetch(`${DEPLOYMENT_URL}/api/init-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-init-secret': INIT_SECRET
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database initialized successfully!');
      console.log('Response:', data);
      console.log('\nYou can now log in with:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.error('❌ Failed to initialize database:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Error connecting to the server:', error.message);
    console.error('\nMake sure:');
    console.error('1. The server is running (npm run dev for local)');
    console.error('2. The URL is correct');
    console.error('3. Your database credentials are set in .env.local');
  }
}

// Run the initialization
initializeDatabase();
