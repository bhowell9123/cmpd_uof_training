import { initializeDatabase, seedDatabase } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Only allow in development or with special header
  if (process.env.NODE_ENV === 'production' && req.headers['x-init-secret'] !== process.env.INIT_SECRET) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    console.log('Initializing database...')
    const tablesCreated = await initializeDatabase()
    
    if (!tablesCreated) {
      return res.status(500).json({ error: 'Failed to create database tables' })
    }

    console.log('Seeding database...')
    const dataSeeded = await seedDatabase()
    
    if (!dataSeeded) {
      return res.status(500).json({ error: 'Failed to seed database' })
    }

    res.status(200).json({ 
      message: 'Database initialized and seeded successfully',
      tablesCreated: true,
      dataSeeded: true
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    res.status(500).json({ 
      error: 'Database initialization failed',
      details: error.message
    })
  }
}
