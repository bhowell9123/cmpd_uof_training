import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContent } from '../contexts/ContentContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Menu,
  Shield,
  BookOpen
} from 'lucide-react'

export default function PresentationView() {
  const { slideId } = useParams()
  const navigate = useNavigate()
  const { getSlide, getAllSlides, modules } = useContent()
  
  const [currentSlideId, setCurrentSlideId] = useState(slideId ? parseInt(slideId) : 1)
  const [showMenu, setShowMenu] = useState(false)
  
  const slideData = getSlide(currentSlideId)
  const allSlides = getAllSlides()
  
  useEffect(() => {
    if (slideId) {
      setCurrentSlideId(parseInt(slideId))
    }
  }, [slideId])

  const navigateToSlide = (direction) => {
    const currentIndex = allSlides.findIndex(slide => slide.id === currentSlideId)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allSlides.length - 1
    } else {
      newIndex = currentIndex < allSlides.length - 1 ? currentIndex + 1 : 0
    }
    
    const newSlideId = allSlides[newIndex].id
    setCurrentSlideId(newSlideId)
    navigate(`/presentation/slide/${newSlideId}`)
  }

  const getCurrentModule = () => {
    return modules.find(module => 
      currentSlideId >= module.slides[0] && currentSlideId <= module.slides[1]
    )
  }

  if (!slideData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading presentation...</p>
        </div>
      </div>
    )
  }

  const currentModule = getCurrentModule()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-white" />
              <div className="text-white">
                <h1 className="text-lg font-semibold">CMPD Use of Force Training</h1>
                <p className="text-sm text-blue-100">
                  {currentModule && `Module ${currentModule.id}: ${currentModule.name}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setShowMenu(!showMenu)}
              >
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Navigation Menu</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMenu(false)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-3">
                {modules.map((module) => (
                  <Button
                    key={module.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentSlideId(module.slides[0])
                      navigate(`/presentation/slide/${module.slides[0]}`)
                      setShowMenu(false)
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Module {module.id}: {module.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-2xl">
          <CardContent className="p-8">
            {/* Slide Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">
                    Slide {currentSlideId} of {allSlides.length}
                  </Badge>
                  {currentModule && (
                    <Badge variant="secondary">
                      Module {currentModule.id}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-blue-900">
                  {slideData.title}
                </h1>
              </div>
            </div>

            {/* Slide Content */}
            <div className="space-y-6 mb-8">
              {slideData.textContent?.map((content, index) => (
                <div key={index}>
                  {content.type === 'highlight-box' && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      {content.title && (
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">
                          {content.title}
                        </h3>
                      )}
                      <p className="text-gray-700 leading-relaxed">{content.content}</p>
                    </div>
                  )}
                  
                  {content.type === 'bullet-list' && (
                    <div>
                      {content.title && (
                        <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
                      )}
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {(Array.isArray(content.items) ? content.items : []).map((item, i) => (
                          <li key={i} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {content.type === 'paragraph' && (
                    <p className="text-gray-700 leading-relaxed text-lg">{content.content}</p>
                  )}
                  
                  {content.type === 'expandable-section' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                        {content.header}
                      </h4>
                      {content.items && content.items.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {content.items.map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {(!slideData.textContent || slideData.textContent.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No content available for this slide.</p>
                </div>
              )}
            </div>

            {/* Slide Images */}
            {slideData.images && slideData.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual References</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slideData.images.map((image, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Image: {image}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        (Image display would be implemented with proper image loading)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigateToSlide('prev')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          
          <div className="text-white text-center">
            <p className="text-sm text-blue-100">
              Slide {currentSlideId} of {allSlides.length}
            </p>
            {currentModule && (
              <p className="text-xs text-blue-200">
                Module {currentModule.id}: {currentModule.name}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigateToSlide('next')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}
