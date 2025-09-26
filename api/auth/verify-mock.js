export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Decode the mock token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Check if token is not too old (24 hours)
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ error: 'Token expired' })
      }

      res.status(200).json({
        valid: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          username: decoded.username,
          email: `${decoded.username}@capemaypd.gov`,
          role: decoded.role,
          name: decoded.username === 'admin' ? 'System Administrator' : 
                decoded.username === 'editor' ? 'Content Editor' : 'Content Reviewer'
        }
      })
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
