import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import contentMapping from '../assets/content_mapping/content_mapping.json'

const ContentContext = createContext()

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

// Default modules structure
const defaultModules = [
  {
    id: 1,
    name: 'Core Principles',
    description: 'Introduction to the core principles of use of force',
    slides: [1, 15]
  },
  {
    id: 2,
    name: 'Definitions and Classifications',
    description: 'Key definitions and classifications related to use of force',
    slides: [16, 30]
  },
  {
    id: 3,
    name: 'Procedures and Techniques',
    description: 'Practical procedures and techniques for use of force situations',
    slides: [31, 38]
  },
  {
    id: 4,
    name: 'Specific Force Options',
    description: 'Detailed information on specific force options available to officers',
    slides: [39, 46]
  },
  {
    id: 5,
    name: 'Post-Incident Procedures',
    description: 'Procedures to follow after a use of force incident',
    slides: [47, 49]
  }
]

export function ContentProvider({ children }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [slides, setSlides] = useState([])
  const [modules, setModules] = useState(defaultModules)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useLocalData, setUseLocalData] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadContent()
    } else {
      // Use local data when not authenticated
      loadLocalContent()
    }
  }, [isAuthenticated])

  // Force reload content when auth state changes
  useEffect(() => {
    // This will ensure content is reloaded after login/logout
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        console.log('[ContentContext] Auth token changed, reloading content...')
        if (isAuthenticated) {
          loadContent()
        } else {
          loadLocalContent()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isAuthenticated])

  const loadLocalContent = () => {
    try {
      console.log('Loading content from local file...')
      const localSlides = Object.entries(contentMapping).map(([key, data]) => {
        const slideId = parseInt(key.replace('slide_', ''))
        const moduleId = getModuleIdForSlide(slideId)
        
        return {
          id: slideId,
          title: data.title || `Slide ${slideId}`,
          content: data.textContent || [],
          images: data.images || undefined,
          module_id: moduleId
        }
      })
      
      setSlides(localSlides)
      setModules(defaultModules)
      setUseLocalData(true)
      setLoading(false)
    } catch (err) {
      console.error('Error loading local content:', err)
      setError('Failed to load local content')
      setLoading(false)
    }
  }

  const loadContent = async () => {
    try {
      console.log('[ContentContext] Loading content from API...')
      setLoading(true)
      setError(null)
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      let response;
      
      // If authenticated, try the database endpoint first
      if (isAuthenticated) {
        console.log('[ContentContext] User is authenticated, trying database endpoint first...')
        response = await fetch(`/api/slides?t=${timestamp}`, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        // If database endpoint fails, fall back to simple endpoint
        if (!response.ok) {
          console.log('[ContentContext] Database endpoint failed, falling back to simple endpoint...')
          response = await fetch(`/api/slides-simple?t=${timestamp}`, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          })
        } else {
          console.log('[ContentContext] Successfully loaded content from database')
        }
      } else {
        // For unauthenticated users, use the simple endpoint
        console.log('[ContentContext] User is not authenticated, using simple endpoint...')
        response = await fetch(`/api/slides-simple?t=${timestamp}`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }

      if (response.ok) {
        const data = await response.json()
        console.log(`[ContentContext] API returned ${data.slides?.length || 0} slides`)
        
        // Transform modules data if needed
        const transformedModules = (data.modules || []).map(module => ({
          ...module,
          slides: module.slides || [module.slide_start || 1, module.slide_end || 1]
        }))
        
        setSlides(data.slides || [])
        setModules(transformedModules.length > 0 ? transformedModules : defaultModules)
        setUseLocalData(false)
        console.log('[ContentContext] Using API data (useLocalData = false)')
      } else {
        console.warn('API failed, falling back to local content')
        loadLocalContent()
      }
    } catch (err) {
      console.error('Error loading content from API:', err)
      console.log('Falling back to local content...')
      loadLocalContent()
    } finally {
      setLoading(false)
    }
  }

  const getModuleIdForSlide = (slideId) => {
    if (slideId >= 1 && slideId <= 15) return 1
    if (slideId >= 16 && slideId <= 30) return 2
    if (slideId >= 31 && slideId <= 38) return 3
    if (slideId >= 39 && slideId <= 46) return 4
    if (slideId >= 47 && slideId <= 49) return 5
    return 1
  }

  const getSlide = (slideId) => {
    const slide = slides.find(s => s.id === slideId)
    if (!slide) {
      // Try to get from local content as fallback
      const localKey = `slide_${slideId}`
      if (contentMapping[localKey]) {
        return {
          id: slideId,
          title: contentMapping[localKey].title || `Slide ${slideId}`,
          textContent: contentMapping[localKey].textContent || [],
          images: contentMapping[localKey].images || undefined
        }
      }
      return null
    }

    // Parse content if it's a string
    let parsedContent = slide.content
    if (typeof slide.content === 'string') {
      try {
        parsedContent = JSON.parse(slide.content)
      } catch (e) {
        parsedContent = []
      }
    }

    return {
      ...slide,
      textContent: parsedContent
    }
  }

  const getAllSlides = () => {
    if (slides.length === 0) {
      // Return local slides if no API slides available
      return Object.entries(contentMapping).map(([key, data]) => {
        const slideId = parseInt(key.replace('slide_', ''))
        return {
          id: slideId,
          title: data.title || `Slide ${slideId}`,
          textContent: data.textContent || [],
          images: data.images || []
        }
      })
    }

    return slides.map(slide => ({
      ...slide,
      textContent: typeof slide.content === 'string' 
        ? JSON.parse(slide.content || '[]') 
        : slide.content
    }))
  }

  const getSlidesByModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return []

    const [startSlide, endSlide] = module.slides

    return slides
      .filter(slide => slide.id >= startSlide && slide.id <= endSlide)
      .map(slide => ({
        ...slide,
        textContent: typeof slide.content === 'string' 
          ? JSON.parse(slide.content || '[]') 
          : slide.content
      }))
  }

  const updateSlide = async (slideId, slideData) => {
    console.log(`[ContentContext] Updating slide ${slideId}, useLocalData: ${useLocalData}`)
    
    // If using local data, just update in memory
    if (useLocalData) {
      console.log('[ContentContext] Using local data, updating in memory only')
      setSlides(prevSlides =>
        prevSlides.map(slide =>
          slide.id === slideId
            ? {
                ...slide,
                title: slideData.title,
                content: slideData.textContent || [],
                images: slideData.images || []
              }
            : slide
        )
      )
      return true
    }

    try {
      console.log('[ContentContext] Using API data, sending PUT request to update slide in database')
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/slides/${slideId}?t=${timestamp}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          title: slideData.title,
          content: slideData.textContent || [],
          images: slideData.images || []
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[ContentContext] Slide updated successfully in database')
        
        // Update local state
        setSlides(prevSlides =>
          prevSlides.map(slide =>
            slide.id === slideId
              ? { ...slide, ...data.slide }
              : slide
          )
        )
        
        return true
      } else {
        const errorData = await response.json()
        console.error('[ContentContext] Failed to update slide in database:', errorData.error)
        throw new Error(errorData.error || 'Failed to update slide')
      }
    } catch (err) {
      console.error('Error updating slide:', err)
      setError(err.message)
      return false
    }
  }

  const discardChanges = (slideId) => {
    // Reload content to discard local changes
    if (isAuthenticated && !useLocalData) {
      loadContent()
    } else {
      loadLocalContent()
    }
  }

  const getUnsavedChangesCount = () => {
    // Since we're using API calls or local memory, there are no unsaved changes
    return 0
  }

  const value = {
    slides: getAllSlides(),
    modules,
    loading,
    error,
    getSlide,
    getAllSlides,
    getSlidesByModule,
    updateSlide,
    discardChanges,
    getUnsavedChangesCount,
    refreshContent: isAuthenticated ? loadContent : loadLocalContent,
    isUsingLocalData: useLocalData
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}
