import { useState } from 'react'
import { AVAILABLE_MODELS } from './lib/generator'
import { useImageUpload } from './hooks/useImageUpload'
import { useVideoGeneration } from './hooks/useVideoGeneration'
import { Header } from './components/Layout/Header'
import { Footer } from './components/Layout/Footer'
import { ErrorAlert } from './components/UI/ErrorAlert'
import { ImageDropzone } from './components/Studio/ImageDropzone'
import { GenerationControls } from './components/Studio/GenerationControls'
import { StudioCanvas } from './components/Studio/StudioCanvas'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<(typeof AVAILABLE_MODELS)[number]>(
    AVAILABLE_MODELS[0]
  )
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9')
  const [durationSeconds, setDurationSeconds] = useState<number>(4)

  const {
    generationState,
    generationStage,
    progress,
    errorMessage,
    setErrorMessage,
    clearError,
    generatedVideoUrl,
    setGeneratedVideoUrl,
    isGenerating,
    generateVideo,
  } = useVideoGeneration()

  const {
    selectedImage,
    selectedFile,
    imageFile,
    isDragging,
    uploadError,
    setUploadError,
    fileInputRef,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClearImage,
  } = useImageUpload(() => {
    // Reset previously generated video when a new image is loaded
    setGeneratedVideoUrl(null)
  })

  const activeError = errorMessage || uploadError
  const handleDismissError = () => {
    clearError()
    setUploadError(null)
  }

  const handleGenerate = async () => {
    await generateVideo({
      model,
      prompt,
      image: selectedFile || selectedImage || '',
      aspectRatio,
      durationSeconds,
    })
  }

  return (
    <div className="relative min-h-screen bg-studio-base bg-grid-pattern text-slate-100 flex flex-col justify-between selection:bg-purple-600/40">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-glow-pulse" />
        <div
          className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-glow-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-[500px] h-96 bg-cyan-600/10 rounded-full blur-3xl animate-glow-pulse"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <Header />

      {/* Main Studio Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Error Alert Banner */}
        <ErrorAlert message={activeError} onDismiss={handleDismissError} />

        {/* Studio Grid: Controls & Preview Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <GenerationControls
              model={model}
              onModelChange={setModel}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              durationSeconds={durationSeconds}
              onDurationSecondsChange={setDurationSeconds}
              prompt={prompt}
              onPromptChange={setPrompt}
              isGenerating={isGenerating}
              generationState={generationState}
              generationStage={generationStage}
              progress={progress}
              onGenerate={handleGenerate}
            >
              <ImageDropzone
                selectedImage={selectedImage}
                imageFile={imageFile}
                isDragging={isDragging}
                isGenerating={isGenerating}
                fileInputRef={fileInputRef}
                onClearImage={handleClearImage}
                onFileInputChange={handleFileInputChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            </GenerationControls>
          </div>

          {/* Canvas / Video Player Column */}
          <div className="lg:col-span-7 space-y-6">
            <StudioCanvas
              generatedVideoUrl={generatedVideoUrl}
              selectedImage={selectedImage}
              aspectRatio={aspectRatio}
              model={model}
              prompt={prompt}
              isGenerating={isGenerating}
              generationStage={generationStage}
              progress={progress}
              onError={setErrorMessage}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
