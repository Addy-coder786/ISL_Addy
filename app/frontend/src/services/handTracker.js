/**
 * MUDRA Hand Tracker Service
 * Wrapper around MediaPipe Hands with browser webcam management,
 * graceful fallback loading, and high-performance canvas landmark rendering.
 */

// MediaPipe Hand Connection Pairs
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base Knuckle Bridge
  [5, 9], [9, 13], [13, 17]
]

class HandTrackerService {
  constructor() {
    this.hands = null
    this.videoElement = null
    this.stream = null
    this.isTracking = false
    this.animationFrameId = null
    this.onResultsCallback = null
    this.isInitialized = false
    this.initializationPromise = null
  }

  /**
   * Initializes MediaPipe Hands solution
   */
  async initialize() {
    if (this.isInitialized && this.hands) return this.hands
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        let HandsConstructor = null

        // Try importing from @mediapipe/hands npm package
        try {
          const mpHands = await import('@mediapipe/hands')
          HandsConstructor = mpHands.Hands || window.Hands
        } catch (err) {
          console.warn('Direct import of @mediapipe/hands failed, attempting global/CDN fallback', err)
        }

        // If not found in module import, check window or load from CDN script
        if (!HandsConstructor && typeof window !== 'undefined') {
          if (window.Hands) {
            HandsConstructor = window.Hands
          } else {
            // Dynamically load script from unpkg/jsdelivr
            await new Promise((res, rej) => {
              const script = document.createElement('script')
              script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
              script.crossOrigin = 'anonymous'
              script.onload = () => res()
              script.onerror = (e) => rej(e)
              document.head.appendChild(script)
            })
            HandsConstructor = window.Hands
          }
        }

        if (!HandsConstructor) {
          throw new Error('MediaPipe Hands library could not be loaded.')
        }

        const hands = new HandsConstructor({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        hands.onResults((results) => {
          if (this.onResultsCallback) {
            this.onResultsCallback(results)
          }
        })

        this.hands = hands
        this.isInitialized = true
        resolve(hands)
      } catch (error) {
        console.error('Failed to initialize MediaPipe Hands:', error)
        reject(error)
      }
    })

    return this.initializationPromise
  }

  /**
   * Starts user webcam and landmark tracking
   */
  async startCamera(videoElement, onResults) {
    if (!videoElement) throw new Error('Video element is required')
    
    this.videoElement = videoElement
    this.onResultsCallback = onResults

    await this.initialize()

    // Request camera permissions
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.stream = stream
      this.videoElement.srcObject = stream
      await this.videoElement.play()

      this.isTracking = true
      this._processVideoLoop()

      return true
    } catch (err) {
      console.error('Camera access error:', err)
      throw err
    }
  }

  /**
   * Continuous processing loop
   */
  async _processVideoLoop() {
    if (!this.isTracking || !this.videoElement || !this.hands) return

    if (this.videoElement.readyState >= 2 && !this.videoElement.paused) {
      try {
        await this.hands.send({ image: this.videoElement })
      } catch (err) {
        console.warn('Frame processing exception:', err)
      }
    }

    if (this.isTracking) {
      this.animationFrameId = requestAnimationFrame(() => this._processVideoLoop())
    }
  }

  /**
   * Stops camera stream and tracking loop
   */
  stopCamera() {
    this.isTracking = false

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  }

  /**
   * Renders high-fidelity MUDRA-styled hand skeleton on HTML5 canvas
   */
  drawSkeleton(ctx, landmarks, width, height, mirror = true) {
    if (!ctx || !landmarks || landmarks.length < 21) return

    ctx.save()
    if (mirror) {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    // 1. Draw Bone Connections with elegant gradient stroke
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    HAND_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i]
      const p2 = landmarks[j]
      if (!p1 || !p2) return

      const x1 = p1.x * width
      const y1 = p1.y * height
      const x2 = p2.x * width
      const y2 = p2.y * height

      // Gradient from Soft Lavender to Peach
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.85)') // #8B5CF6
      gradient.addColorStop(1, 'rgba(253, 186, 116, 0.90)') // #FDBA74

      ctx.strokeStyle = gradient
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

    // 2. Draw Keypoint Nodes (Joint Dots)
    landmarks.forEach((p, idx) => {
      const x = p.x * width
      const y = p.y * height

      const isFingertip = [4, 8, 12, 16, 20].includes(idx)
      const isWrist = idx === 0

      // Outer soft glow aura
      ctx.beginPath()
      ctx.arc(x, y, isFingertip ? 7 : isWrist ? 6 : 4.5, 0, 2 * Math.PI)
      ctx.fillStyle = isFingertip
        ? 'rgba(249, 115, 22, 0.35)'
        : 'rgba(139, 92, 246, 0.25)'
      ctx.fill()

      // Inner solid node
      ctx.beginPath()
      ctx.arc(x, y, isFingertip ? 4.5 : isWrist ? 4 : 3, 0, 2 * Math.PI)
      ctx.fillStyle = isFingertip ? '#F97316' : '#8B5CF6'
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.5
      ctx.fill()
      ctx.stroke()
    })

    ctx.restore()
  }
}

export const handTracker = new HandTrackerService()
export default handTracker
