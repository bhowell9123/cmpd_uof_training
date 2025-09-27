import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const contentMapping = require('../src/assets/content_mapping/content_mapping.json')

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    res.setHeader('X-Vercel-Cache-Control', 'no-store');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Transform content mapping to slides format
    const slides = Object.entries(contentMapping).map(([key, data]) => {
      const slideId = parseInt(key.replace('slide_', ''))
      const moduleId = getModuleIdForSlide(slideId)
      
      return {
        id: slideId,
        title: data.title || `Slide ${slideId}`,
        content: data.textContent || [],
        images: data.images || [],
        module_id: moduleId
      }
    })

    // Define modules
    const modules = [
      {
        id: 1,
        name: 'Core Principles',
        description: 'Introduction to the core principles of use of force',
        slide_start: 1,
        slide_end: 15,
        slides: [1, 15]
      },
      {
        id: 2,
        name: 'Definitions and Classifications',
        description: 'Key definitions and classifications related to use of force',
        slide_start: 16,
        slide_end: 30,
        slides: [16, 30]
      },
      {
        id: 3,
        name: 'Procedures and Techniques',
        description: 'Practical procedures and techniques for use of force situations',
        slide_start: 31,
        slide_end: 38,
        slides: [31, 38]
      },
      {
        id: 4,
        name: 'Specific Force Options',
        description: 'Detailed information on specific force options available to officers',
        slide_start: 39,
        slide_end: 46,
        slides: [39, 46]
      },
      {
        id: 5,
        name: 'Post-Incident Procedures',
        description: 'Procedures to follow after a use of force incident',
        slide_start: 47,
        slide_end: 49,
        slides: [47, 49]
      }
    ]

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
    res.status(500).json({ error: 'Internal server error' })
  }
}

function getModuleIdForSlide(slideId) {
  if (slideId >= 1 && slideId <= 15) return 1
  if (slideId >= 16 && slideId <= 30) return 2
  if (slideId >= 31 && slideId <= 38) return 3
  if (slideId >= 39 && slideId <= 46) return 4
  if (slideId >= 47 && slideId <= 49) return 5
  return 1
}
