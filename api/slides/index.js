import { requirePermission } from '../../src/lib/auth'
import { getAllSlides, getAllModules } from '../../src/lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

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
