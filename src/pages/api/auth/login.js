import { getUserWithPassword, updateUserLastLogin } from '../../../lib/db'
import { comparePassword, generateToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Get user from database
    const user = await getUserWithPassword(username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await updateUserLastLogin(user.id)

    // Generate JWT token
    const token = generateToken(user)

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user
    
    res.status(200).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
