import { requirePermission } from '../../../lib/auth'
import { getSlideById, updateSlide } from '../../../lib/db'

async function getHandler(req, res) {
  try {
    const { id } = req.query
    const slideId = parseInt(id)

    if (isNaN(slideId)) {
      return res.status(400).json({ error: 'Invalid slide ID' })
    }

    const slide = await getSlideById(slideId)
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' })
    }

    res.status(200).json({ slide })
  } catch (error) {
    console.error('Error fetching slide:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function putHandler(req, res) {
  try {
    const { id } = req.query
    const { title, content, images } = req.body
    const slideId = parseInt(id)

    if (isNaN(slideId)) {
      return res.status(400).json({ error: 'Invalid slide ID' })
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const updatedSlide = await updateSlide(
      slideId,
      title,
      content || [],
      images || [],
      req.user.userId
    )

    if (!updatedSlide) {
      return res.status(404).json({ error: 'Slide not found' })
    }

    res.status(200).json({ slide: updatedSlide })
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

export default requirePermission('read')(handler)
