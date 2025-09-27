import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useContent } from '../contexts/ContentContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Undo, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function SlideEditor() {
  const { slideId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const { 
    getSlide, 
    updateSlide, 
    getAllSlides, 
    getSlidesByModule, 
    discardChanges,
    modules 
  } = useContent()

  const [currentSlideId, setCurrentSlideId] = useState(slideId ? parseInt(slideId) : 1)
  const [slideData, setSlideData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const moduleId = searchParams.get('module')
  const availableSlides = moduleId 
    ? getSlidesByModule(parseInt(moduleId))
    : getAllSlides()

  useEffect(() => {
    loadSlide(currentSlideId)
  }, [currentSlideId])

  const loadSlide = (id) => {
    const slide = getSlide(id)
    if (slide) {
      setSlideData({ ...slide })
      setOriginalData({ ...slide })
      setHasChanges(false)
      setSaveStatus(null)
    }
  }

  const handleFieldChange = (field, value) => {
    if (!hasPermission('write')) return

    const newData = { ...slideData, [field]: value }
    setSlideData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData))
  }

  const handleTextContentChange = (index, field, value) => {
    if (!hasPermission('write')) return

    const newTextContent = [...slideData.textContent]
    newTextContent[index] = { ...newTextContent[index], [field]: value }
    
    const newData = { ...slideData, textContent: newTextContent }
    setSlideData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData))
  }

  const addTextContent = (type = 'paragraph') => {
    if (!hasPermission('write')) return

    const newContent = {
      type,
      content: type === 'bullet-list' ? undefined : '',
      ...(type === 'bullet-list' && { items: [], title: '' }),
      ...(type === 'highlight-box' && { title: '' }),
      ...(type === 'expandable-section' && { header: '', items: [] })
    }

    const newTextContent = [...(slideData.textContent || []), newContent]
    const newData = { ...slideData, textContent: newTextContent }
    setSlideData(newData)
    setHasChanges(true)
  }

  const removeTextContent = (index) => {
    if (!hasPermission('write')) return

    const newTextContent = slideData.textContent.filter((_, i) => i !== index)
    const newData = { ...slideData, textContent: newTextContent }
    setSlideData(newData)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasPermission('write') || !hasChanges) return

    setSaving(true)
    try {
      const success = updateSlide(currentSlideId, slideData)
      if (success) {
        setOriginalData({ ...slideData })
        setHasChanges(false)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (!hasChanges) return
    
    discardChanges(currentSlideId)
    loadSlide(currentSlideId)
  }

  const navigateToSlide = (direction) => {
    const currentIndex = availableSlides.findIndex(slide => slide.id === currentSlideId)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : availableSlides.length - 1
    } else {
      newIndex = currentIndex < availableSlides.length - 1 ? currentIndex + 1 : 0
    }
    
    const newSlideId = availableSlides[newIndex].id
    setCurrentSlideId(newSlideId)
    navigate(`/admin/slides/${newSlideId}${moduleId ? `?module=${moduleId}` : ''}`)
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    if (!hasPermission('write')) return
    
    const file = e.target.files[0]
    if (!file) return
    
    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG and PNG images are supported')
      return
    }
    
    setUploadingImage(true)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageDataUrl = event.target.result
      
      // Add the new image to the slide data
      const newImages = [...(slideData.images || []), imageDataUrl]
      const newData = { ...slideData, images: newImages }
      setSlideData(newData)
      setHasChanges(true)
      setUploadingImage(false)
      
      // Reset the file input
      e.target.value = null
    }
    
    reader.onerror = () => {
      alert('Failed to read the image file')
      setUploadingImage(false)
      e.target.value = null
    }
    
    reader.readAsDataURL(file)
  }
  
  // Remove image from slide
  const removeImage = (index) => {
    if (!hasPermission('write')) return
    
    const newImages = slideData.images.filter((_, i) => i !== index)
    const newData = { ...slideData, images: newImages }
    setSlideData(newData)
    setHasChanges(true)
  }

  if (!slideData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Slide {currentSlideId}: {slideData.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {moduleId && `Module ${moduleId} • `}
                  Slide {availableSlides.findIndex(s => s.id === currentSlideId) + 1} of {availableSlides.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {saveStatus === 'success' && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              
              {saveStatus === 'error' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/presentation/slide/${currentSlideId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              {hasPermission('write') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={!hasChanges}
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slide Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Slide Title</Label>
                  <Input
                    id="title"
                    value={slideData.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    disabled={!hasPermission('write')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Content Sections</CardTitle>
                  {hasPermission('write') && (
                    <Button
                      size="sm"
                      onClick={() => addTextContent('paragraph')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {slideData.textContent?.map((content, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{content.type}</Badge>
                      {hasPermission('write') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeTextContent(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {content.type === 'highlight-box' && (
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={content.title || ''}
                          onChange={(e) => handleTextContentChange(index, 'title', e.target.value)}
                          disabled={!hasPermission('write')}
                        />
                      </div>
                    )}
                    
                    {content.type === 'expandable-section' && (
                      <div>
                        <Label>Header</Label>
                        <Input
                          value={content.header || ''}
                          onChange={(e) => handleTextContentChange(index, 'header', e.target.value)}
                          disabled={!hasPermission('write')}
                        />
                      </div>
                    )}
                    
                    {content.type === 'expandable-section' ? (
                      <div>
                        <Label>Items (one per line)</Label>
                        <Textarea
                          value={
                            Array.isArray(content.items)
                              ? content.items.join('\n')
                              : ''
                          }
                          onChange={(e) => {
                            const items = e.target.value.split('\n').filter(line => line.trim())
                            handleTextContentChange(index, 'items', items)
                          }}
                          disabled={!hasPermission('write')}
                          rows={4}
                          placeholder="Enter each item on a new line"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label>{content.type === 'bullet-list' ? 'Items (one per line)' : 'Content'}</Label>
                        <Textarea
                          value={
                            content.type === 'bullet-list'
                              ? (Array.isArray(content.items) ? content.items.join('\n') : '')
                              : (Array.isArray(content.content)
                                ? content.content.join('\n')
                                : content.content || '')
                          }
                          onChange={(e) => {
                            const value = content.type === 'bullet-list'
                              ? e.target.value.split('\n').filter(line => line.trim())
                              : e.target.value
                            handleTextContentChange(index, content.type === 'bullet-list' ? 'items' : 'content', value)
                          }}
                          disabled={!hasPermission('write')}
                          rows={4}
                          placeholder={content.type === 'bullet-list' ? 'Enter each item on a new line' : ''}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {(!slideData.textContent || slideData.textContent.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No content sections. Click "Add Section" to get started.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Upload Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Visual References</CardTitle>
                  {hasPermission('write') && (
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Upload JPEG or PNG images to include in the slide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg, image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={!hasPermission('write')}
                />
                
                {slideData.images && slideData.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slideData.images.map((image, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        {image.startsWith('data:image/') ? (
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-auto rounded"
                          />
                        ) : (
                          <div className="bg-gray-100 p-4 text-center rounded">
                            <p className="text-sm text-gray-600">{image}</p>
                          </div>
                        )}
                        
                        {hasPermission('write') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                    <p>No images uploaded. Click "Add Image" to upload.</p>
                    <p className="text-xs mt-2">Supported formats: JPEG, PNG</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your changes will appear in the presentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6 min-h-96">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">
                    {slideData.title}
                  </h2>
                  
                  <div className="space-y-4">
                    {slideData.textContent?.map((content, index) => (
                      <div key={index}>
                        {content.type === 'highlight-box' && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            {content.title && (
                              <h3 className="font-semibold text-blue-900 mb-2">
                                {content.title}
                              </h3>
                            )}
                            <p className="text-gray-700">{content.content}</p>
                          </div>
                        )}
                        
                        {content.type === 'bullet-list' && (
                          <ul className="list-disc list-inside space-y-1">
                            {(Array.isArray(content.items) ? content.items : []).map((item, i) => (
                              <li key={i} className="text-gray-700">{item}</li>
                            ))}
                          </ul>
                        )}
                        
                        {content.type === 'paragraph' && (
                          <p className="text-gray-700">{content.content}</p>
                        )}
                        
                        {content.type === 'expandable-section' && (
                          <div className="border rounded p-3">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {content.header}
                            </h4>
                            {content.items && content.items.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {content.items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Preview of Images */}
                  {slideData.images && slideData.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Visual References</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {slideData.images.map((image, index) => (
                          <div key={index} className="border rounded p-2">
                            {image.startsWith('data:image/') ? (
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-auto rounded"
                              />
                            ) : (
                              <div className="bg-gray-100 p-2 text-center rounded">
                                <p className="text-xs text-gray-600">{image}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => navigateToSlide('prev')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    {availableSlides.findIndex(s => s.id === currentSlideId) + 1} of {availableSlides.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateToSlide('next')}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
