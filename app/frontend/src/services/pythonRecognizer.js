const DEFAULT_ENDPOINT = 'http://127.0.0.1:8765/predict'
const WINDOW_FRAMES = 1

class PythonRecognizer {
  constructor() {
    this.endpoint = DEFAULT_ENDPOINT
    this.frames = []
    this.requestInFlight = false
    this.lastPrediction = null
    this.enabled = false
    this.onPrediction = null
  }

  configure({ endpoint = DEFAULT_ENDPOINT, enabled = false } = {}) {
    this.endpoint = endpoint
    this.enabled = enabled
    this.reset()
  }

  reset() {
    this.frames = []
    this.requestInFlight = false
    this.lastPrediction = null
  }

  addFrame(results) {
    if (!this.enabled) return

    const hands = results.multiHandLandmarks || []
    const handedness = results.multiHandedness || []
    const frame = { pose: null, left: null, right: null }

    hands.forEach((landmarks, index) => {
      const label = handedness[index]?.[0]?.label?.toLowerCase()
      if (label === 'left' || (!label && !frame.left)) frame.left = landmarks
      else frame.right = landmarks
    })

    this.frames.push(frame)
    if (this.frames.length > WINDOW_FRAMES) this.frames.shift()

    if (this.frames.length === WINDOW_FRAMES && !this.requestInFlight) {
      this.predict(this.frames.slice())
    }
  }

  async predict(frames) {
    this.requestInFlight = true
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames })
      })
      if (!response.ok) return
      this.lastPrediction = await response.json()
      if (this.onPrediction) this.onPrediction(this.lastPrediction)
    } catch {
      // The browser classifier remains authoritative when the bridge is offline.
    } finally {
      this.requestInFlight = false
    }
  }

  getPrediction() {
    return this.lastPrediction
  }
}

export const pythonRecognizer = new PythonRecognizer()
export default pythonRecognizer