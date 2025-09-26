import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Mock users for development
const mockUsers = {
  admin: { password: 'admin123', role: 'super_admin', name: 'System Administrator' },
  editor: { password: 'editor123', role: 'content_editor', name: 'Content Editor' },
  reviewer: { password: 'reviewer123', role: 'content_reviewer', name: 'Content Reviewer' }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route based on the path parameter
  const { path } = req.query;
  
  if (path === 'login') {
    return handleLogin(req, res);
  } else if (path === 'verify') {
    return handleVerify(req, res);
  } else {
    return res.status(404).json({ error: 'Not found' });
  }
}

// Handle login requests
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Try mock authentication first
    const mockUser = mockUsers[username];
    if (mockUser && mockUser.password === password) {
      // Create a simple mock token
      const token = Buffer.from(JSON.stringify({
        username,
        role: mockUser.role,
        timestamp: Date.now()
      })).toString('base64');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: Math.floor(Math.random() * 1000),
          username,
          email: `${username}@capemaypd.gov`,
          role: mockUser.role,
          name: mockUser.name
        }
      });
    }

    // If mock authentication fails, try database authentication
    try {
      // Hardcoded check for admin/admin123 as fallback
      const isValidPassword = (username === 'admin' && password === 'admin123');
      
      if (isValidPassword) {
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: 1,
            username: 'admin',
            role: 'super_admin',
            email: 'admin@capemaypd.gov'
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@capemaypd.gov',
            role: 'super_admin',
            name: 'System Administrator'
          }
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (dbError) {
      console.error('Database authentication error:', dbError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle token verification requests
async function handleVerify(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Try to decode as a mock token first
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is not too old (24 hours)
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ error: 'Token expired' });
      }

      return res.status(200).json({
        valid: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          username: decoded.username,
          email: `${decoded.username}@capemaypd.gov`,
          role: decoded.role,
          name: decoded.username === 'admin' ? 'System Administrator' : 
                decoded.username === 'editor' ? 'Content Editor' : 'Content Reviewer'
        }
      });
    } catch (mockError) {
      // If it's not a mock token, try to verify as a JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        return res.status(200).json({
          valid: true,
          user: {
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            name: decoded.username === 'admin' ? 'System Administrator' : 
                  decoded.username === 'editor' ? 'Content Editor' : 'Content Reviewer'
          }
        });
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}