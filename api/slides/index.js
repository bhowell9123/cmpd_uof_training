import { requirePermission } from '../../src/lib/auth.js'
import { getAllSlides, getAllModules } from '../../src/lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const slides = await getAllSlides()
    const modules = await getAllModules()

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    return res.status(200).json({
      slides,
      modules
    });
  } catch (error) {
    console.error('Error fetching slides:', error)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requirePermission('read')(handler)
