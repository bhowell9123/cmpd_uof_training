import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only allow in development or with special header
  if (process.env.NODE_ENV === 'production' && req.headers['x-init-secret'] !== process.env.INIT_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    console.log('Initializing database with simple setup...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `;

    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) FROM users`;
    
    // Only seed if no users exist
    if (existingUsers.rows[0].count === '0') {
      // Create default users with pre-hashed passwords
      // 'admin123' hashed with bcrypt
      const adminPasswordHash = '$2a$10$JcmUQDnXBCwDOpk1Vt9gveYeKxZ0Zp5eKEDZUB.5NNMOUYUf/Uwx6';
      
      await sql`
        INSERT INTO users (username, email, password_hash, role, name) VALUES
        ('admin', 'admin@capemaypd.gov', ${adminPasswordHash}, 'super_admin', 'System Administrator')
      `;
      
      console.log('Default admin user created');
    } else {
      console.log('Users already exist, skipping user creation');
    }

    res.status(200).json({ 
      message: 'Database initialized successfully with admin user',
      success: true
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed',
      details: error.message
    });
  }
}