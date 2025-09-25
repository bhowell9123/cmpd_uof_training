import { requireAuth } from '../../../lib/auth'
import { getUserByUsername } from '../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get fresh user data from database
    const user = await getUserByUsername(req.user.username)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireAuth(handler)
