import { requirePermission } from '../../src/lib/auth.js'
import { getAllSlides, getAllModules, createSlide } from '../../src/lib/db.js'

async function getHandler(req, res) {

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

async function postHandler(req, res) {
  console.log(`[API] POST request to create new slide`)
  try {
    const { title, content, images, moduleId } = req.body
    
    console.log(`[API] Creating new slide with title: ${title}, moduleId: ${moduleId}`)
    console.log(`[API] User ID: ${req.user.userId}`)

    if (!title) {
      console.log(`[API] Title is required`)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
      res.setHeader('X-Vercel-Cache-Control', 'no-store');
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!moduleId) {
      console.log(`[API] Module ID is required`)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
      res.setHeader('X-Vercel-Cache-Control', 'no-store');
      return res.status(400).json({ error: 'Module ID is required' });
    }

    const newSlide = await createSlide(
      title,
      content || [],
      images || [],
      moduleId,
      req.user.userId
    )

    if (!newSlide) {
      console.log(`[API] Failed to create new slide`)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
      res.setHeader('X-Vercel-Cache-Control', 'no-store');
      return res.status(500).json({ error: 'Failed to create slide' });
    }

    console.log(`[API] Slide created successfully with ID ${newSlide.id}`)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    return res.status(201).json({ slide: newSlide });
  } catch (error) {
    console.error('Error creating slide:', error)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getHandler(req, res)
    case 'POST':
      return postHandler(req, res)
    default:
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
      res.setHeader('X-Vercel-Cache-Control', 'no-store');
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requirePermission('read')(handler)
