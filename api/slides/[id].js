import { requirePermission } from '../../src/lib/auth.js'
import { getSlideById, updateSlide } from '../../src/lib/db.js'

async function getHandler(req, res) {
  try {
    const { id } = req.query
    const slideId = parseInt(id)

    if (isNaN(slideId)) {
      return res.status(400)
        .set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'X-Vercel-Cache-Control': 'no-store'
        })
        .json({ error: 'Invalid slide ID' })
    }

    const slide = await getSlideById(slideId)
    if (!slide) {
      return res.status(404)
        .set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'X-Vercel-Cache-Control': 'no-store'
        })
        .json({ error: 'Slide not found' })
    }

    return res.status(200)
      .set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'X-Vercel-Cache-Control': 'no-store'
      })
      .json({ slide })
  } catch (error) {
    console.error('Error fetching slide:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function putHandler(req, res) {
  console.log(`[API] PUT request to update slide ${req.query.id}`)
  try {
    const { id } = req.query
    const { title, content, images } = req.body
    const slideId = parseInt(id)

    console.log(`[API] Updating slide ${slideId}, title: ${title}, content length: ${Array.isArray(content) ? content.length : 'N/A'}, images length: ${Array.isArray(images) ? images.length : 'N/A'}`)
    console.log(`[API] User ID: ${req.user.userId}`)

    if (isNaN(slideId)) {
      console.log(`[API] Invalid slide ID: ${id}`)
      return res.status(400)
        .set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'X-Vercel-Cache-Control': 'no-store'
        })
        .json({ error: 'Invalid slide ID' })
    }

    if (!title) {
      console.log(`[API] Title is required`)
      return res.status(400)
        .set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'X-Vercel-Cache-Control': 'no-store'
        })
        .json({ error: 'Title is required' })
    }

    const updatedSlide = await updateSlide(
      slideId,
      title,
      content || [],
      images || [],
      req.user.userId
    )

    if (!updatedSlide) {
      console.log(`[API] Slide not found or update failed: ${slideId}`)
      return res.status(404)
        .set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'X-Vercel-Cache-Control': 'no-store'
        })
        .json({ error: 'Slide not found' })
    }

    console.log(`[API] Slide ${slideId} updated successfully`)
    return res.status(200)
      .set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'X-Vercel-Cache-Control': 'no-store'
      })
      .json({ slide: updatedSlide })
  } catch (error) {
    console.error('Error updating slide:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getHandler(req, res)
    case 'PUT':
      return putHandler(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

export default requirePermission('write')(handler)
