import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ContentContext = createContext()

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

export function ContentProvider({ children }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [slides, setSlides] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadContent()
    }
  }, [isAuthenticated])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/slides', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSlides(data.slides || [])
        setModules(data.modules || [])
      } else {
        throw new Error('Failed to load content')
      }
    } catch (err) {
      console.error('Error loading content:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSlide = (slideId) => {
    const slide = slides.find(s => s.id === slideId)
    if (!slide) return null

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

    return slides
      .filter(slide => slide.id >= module.slide_start && slide.id <= module.slide_end)
      .map(slide => ({
        ...slide,
        textContent: typeof slide.content === 'string' 
          ? JSON.parse(slide.content || '[]') 
          : slide.content
      }))
  }

  const updateSlide = async (slideId, slideData) => {
    try {
      const response = await fetch(`/api/slides/${slideId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: slideData.title,
          content: slideData.textContent || [],
          images: slideData.images || []
        })
      })

      if (response.ok) {
        const data = await response.json()
        
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
    loadContent()
  }

  const getUnsavedChangesCount = () => {
    // Since we're using API calls, there are no local unsaved changes
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
    refreshContent: loadContent
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}
