import { useState, useRef, useEffect } from 'react'
import './VideoCaptioner.css'

// Define the structure for our caption objects
interface Caption {
  id: number
  text: string
  startTime: number
  endTime: number
}

function VideoCaptioner() {
  // State for video handling
  const [videoUrl, setVideoUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // State for captions
  const [captions, setCaptions] = useState<Caption[]>([])
  const [currentCaption, setCurrentCaption] = useState('')

  // State for the caption form
  const [newCaption, setNewCaption] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  // Error handling
  const [error, setError] = useState('')

  // Reload video when URL changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      resetCaptionState()
    }
  }, [videoUrl])

  // Helper function to reset caption state
  const resetCaptionState = () => {
    setIsValidUrl(false)
    setCurrentCaption('')
    setCaptions([])
  }

  // Handle video playback and caption display
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return

    const currentTime = videoRef.current.currentTime
    
    // Find any caption that should be displayed at current time
    const activeCaption = captions.find(caption => 
      currentTime >= caption.startTime && currentTime <= caption.endTime
    )

    setCurrentCaption(activeCaption ? activeCaption.text : '')
  }

  // Handle URL input changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim()
    setVideoUrl(url)
    setError('')
    setIsValidUrl(false)
  }

  // Handle video loading errors
  const handleVideoError = () => {
    setError('Video failed to load. Please check the URL and try again.')
    setIsValidUrl(false)
  }

  // Handle successful video load
  const handleVideoLoad = () => {
    const video = videoRef.current;
    if (video instanceof HTMLVideoElement && video.readyState >= 2) {
      setIsValidUrl(true)
      setError('')
    }
  }

  // Add new caption to the list
  const addCaption = () => {
    // Validate input
    if (!newCaption || !startTime || !endTime) {
      alert('Please fill in all caption fields')
      return
    }

    // Create new caption object
    const newCaptionObj: Caption = {
      id: Date.now(),
      text: newCaption,
      startTime: parseFloat(startTime),
      endTime: parseFloat(endTime)
    }

    // Add to captions list and reset form
    setCaptions(prev => [...prev, newCaptionObj])
    clearCaptionForm()
  }

  // Helper to clear the caption form
  const clearCaptionForm = () => {
    setNewCaption('')
    setStartTime('')
    setEndTime('')
  }

  return (
    <div className="video-captioner">
      {/* Header and URL input */}
      <div className="url-input-container">
        <h1 className="title">Video Captioner</h1>
        <input
          type="text"
          placeholder="Paste your video URL here..."
          value={videoUrl}
          onChange={handleUrlChange}
          className="url-input"
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Video player */}
      <div className="video-container">
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            onTimeUpdate={handleVideoTimeUpdate}
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
            className="video-player"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser doesn't support video playback.
          </video>
        ) : (
          <div className="video-placeholder">
            Enter a video URL above to begin
          </div>
        )}
        {currentCaption && (
          <div className="caption-overlay">
            {currentCaption}
          </div>
        )}
      </div>

      {/* Caption input form */}
      <div className={`caption-form ${!isValidUrl ? 'disabled' : ''}`}>
        <h2>Add New Caption</h2>
        <textarea
          placeholder="Type your caption here..."
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
          className="caption-textarea"
          disabled={!isValidUrl}
        />
        <div className="timestamp-container">
          <input
            type="number"
            placeholder="Start (seconds)"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="timestamp-input"
            step="0.1"
            min="0"
            disabled={!isValidUrl}
          />
          <input
            type="number"
            placeholder="End (seconds)"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="timestamp-input"
            step="0.1"
            min="0"
            disabled={!isValidUrl}
          />
        </div>
        <button 
          onClick={addCaption} 
          className="add-button"
          disabled={!isValidUrl}
        >
          Add Caption
        </button>
      </div>

      {/* Caption list */}
      <div className="caption-list">
        <h3>Your Captions</h3>
        {captions.length > 0 ? (
          captions.map(caption => (
            <div key={caption.id} className="caption-item">
              <div className="caption-text">{caption.text}</div>
              <div className="caption-time">
                {caption.startTime}s - {caption.endTime}s
              </div>
            </div>
          ))
        ) : (
          <div className="no-captions">
            No captions added yet
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCaptioner 