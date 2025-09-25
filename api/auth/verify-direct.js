import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    console.log(`Auth header: ${authHeader}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log(`Token: ${token}`);
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log(`Decoded token:`, decoded);
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get user from database to ensure they still exist
    console.log('Querying database for user');
    const result = await sql`
      SELECT id, username, email, role, name
      FROM users 
      WHERE username = ${decoded.username}
    `;
    
    console.log(`Query result rows: ${result.rows.length}`);
    
    if (result.rows.length === 0) {
      console.log('No user found with that username');
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    console.log(`User found: ${user.username}, role: ${user.role}`);
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}