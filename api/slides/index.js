import { requirePermission } from '../../src/lib/auth'
import { getAllSlides, getAllModules } from '../../src/lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const slides = await getAllSlides()
    const modules = await getAllModules()

    res.status(200).json({
      slides,
      modules
    })
  } catch (error) {
    console.error('Error fetching slides:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default requirePermission('read')(handler)
