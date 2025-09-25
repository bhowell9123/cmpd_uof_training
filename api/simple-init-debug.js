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
    console.log('Initializing database with debug info...');
    
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
    console.log('Users table created or already exists');

    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) FROM users`;
    console.log(`Existing users count: ${existingUsers.rows[0].count}`);
    
    // Only seed if no users exist
    if (existingUsers.rows[0].count === '0') {
      console.log('No users found, creating admin user');
      
      // Use a specific, known password hash for 'admin123'
      const plainPassword = 'admin123';
      const adminPasswordHash = '$2a$10$JcmUQDnXBCwDOpk1Vt9gveYeKxZ0Zp5eKEDZUB.5NNMOUYUf/Uwx6';
      console.log(`Using fixed hash for '${plainPassword}': ${adminPasswordHash}`);
      
      // Verify the hash works with the password
      const verifyHash = await bcrypt.compare(plainPassword, adminPasswordHash);
      console.log(`Hash verification result: ${verifyHash}`);
      
      // Insert admin user
      await sql`
        INSERT INTO users (username, email, password_hash, role, name) VALUES
        ('admin', 'admin@capemaypd.gov', ${adminPasswordHash}, 'super_admin', 'System Administrator')
      `;
      
      console.log('Admin user created successfully');
      
      // Verify the user was created
      const verifyUser = await sql`SELECT * FROM users WHERE username = 'admin'`;
      console.log('Verification query result:', JSON.stringify(verifyUser.rows[0], null, 2));
    } else {
      console.log('Users already exist, skipping user creation');
      
      // Show existing admin user
      const adminUser = await sql`SELECT * FROM users WHERE username = 'admin'`;
      if (adminUser.rows.length > 0) {
        console.log('Existing admin user found:', JSON.stringify({
          id: adminUser.rows[0].id,
          username: adminUser.rows[0].username,
          email: adminUser.rows[0].email,
          role: adminUser.rows[0].role,
          password_hash_length: adminUser.rows[0].password_hash.length
        }, null, 2));
      } else {
        console.log('No admin user found in the database');
      }
    }

    res.status(200).json({ 
      message: 'Database initialized successfully with admin user',
      success: true
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed',
      details: error.message,
      stack: error.stack
    });
  }
}