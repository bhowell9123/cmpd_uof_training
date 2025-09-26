export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    // Simple mock authentication
    const users = {
      admin: { password: 'admin123', role: 'super_admin', name: 'System Administrator' },
      editor: { password: 'editor123', role: 'content_editor', name: 'Content Editor' },
      reviewer: { password: 'reviewer123', role: 'content_reviewer', name: 'Content Reviewer' }
    }

    const user = users[username]
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create a simple mock token
    const token = Buffer.from(JSON.stringify({
      username,
      role: user.role,
      timestamp: Date.now()
    })).toString('base64')

    res.status(200).json({
      success: true,
      token,
      user: {
        id: Math.floor(Math.random() * 1000),
        username,
        email: `${username}@capemaypd.gov`,
        role: user.role,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
