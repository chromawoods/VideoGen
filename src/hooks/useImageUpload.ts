import { useState, useRef, useEffect } from 'react'

export interface ImageFileInfo {
  name: string
  size: string
}

export function useImageUpload(onImageLoaded?: () => void) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<ImageFileInfo | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Automatically revoke previous object URL on change or unmount
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage)
      }
    }
  }, [selectedImage])

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPEG, WEBP).')
      return false
    }
    setUploadError(null)

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    setImageFile({ name: file.name, size: sizeFormatted })
    setSelectedFile(file)

    // Use zero-copy Object URL for lightweight, synchronous preview
    const previewUrl = URL.createObjectURL(file)
    setSelectedImage(previewUrl)
    onImageLoaded?.()
    return true
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setImageFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return {
    selectedImage,
    setSelectedImage,
    selectedFile,
    setSelectedFile,
    imageFile,
    isDragging,
    uploadError,
    setUploadError,
    fileInputRef,
    processFile,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClearImage,
  }
}
