import { requirePermission } from '../../src/lib/auth'
import { getAllSlides, getAllModules } from '../../src/lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const slides = await getAllSlides()
    const modules = await getAllModules()

    return res
      .status(200)
      .set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'X-Vercel-Cache-Control': 'no-store'
      })
      .json({
        slides,
        modules
      })
  } catch (error) {
    console.error('Error fetching slides:', error)
    res.status(500)
      .set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'X-Vercel-Cache-Control': 'no-store'
      })
      .json({ error: 'Internal server error' })
  }
}

export default requirePermission('read')(handler)
