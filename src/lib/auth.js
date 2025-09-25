import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

export function getPermissions(role) {
  const permissions = {
    super_admin: {
      read: true,
      write: true,
      delete: true,
      manage_users: true,
      view_audit: true
    },
    content_editor: {
      read: true,
      write: true,
      delete: false,
      manage_users: false,
      view_audit: false
    },
    content_reviewer: {
      read: true,
      write: false,
      delete: false,
      manage_users: false,
      view_audit: false
    }
  }
  
  return permissions[role] || {
    read: false,
    write: false,
    delete: false,
    manage_users: false,
    view_audit: false
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }
      
      const decoded = verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' })
      }
      
      req.user = decoded
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' })
    }
  }
}

export function requirePermission(permission) {
  return (handler) => {
    return requireAuth(async (req, res) => {
      const userPermissions = getPermissions(req.user.role)
      
      if (!userPermissions[permission]) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      
      return handler(req, res)
    })
  }
}
