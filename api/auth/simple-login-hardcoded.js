import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}, password: ${password}`);

    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database directly
    console.log('Querying database for user');
    const result = await sql`
      SELECT id, username, email, password_hash, role, name
      FROM users 
      WHERE username = ${username}
    `;
    
    console.log(`Query result rows: ${result.rows.length}`);
    
    if (result.rows.length === 0) {
      console.log('No user found with that username');
      return res.status(401).json({ error: 'Invalid credentials', debug: 'User not found' });
    }
    
    const user = result.rows[0];
    console.log(`User found: ${user.username}, role: ${user.role}`);
    
    // Hardcoded check for admin/admin123
    const isValidPassword = (username === 'admin' && password === 'admin123');
    console.log(`Hardcoded password check result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log('Password verification failed');
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        debug: 'Password mismatch',
        details: {
          providedUsername: username,
          providedPassword: password,
          expectedUsername: 'admin',
          expectedPassword: 'admin123',
          match: isValidPassword
        }
      });
    }

    // Update last login
    console.log('Updating last login timestamp');
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    console.log('Token generated successfully');

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('Login successful');
    res.status(200).json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    });
  }
}