/**
 * MUDRA Sign Recognizer client
 *
 * Streams a rolling window of MediaPipe landmarks to the backend model (/predict) and
 * reports predictions. Only landmark coordinates are sent, never camera images.
 *
 * The model was trained on whole isolated signs, so the window (about 2.5 s) should cover
 * one sign from start to finish. Requests are skipped while no hands are visible.
 *
 * Configure with VITE_API_URL (backend address) and VITE_SIGN_MODEL=off to disable.
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
const MODE = import.meta.env?.VITE_SIGN_MODEL || 'auto'

const WINDOW_MS = 2500
const MIN_FRAMES = 12
const MAX_FRAMES_SENT = 48
const REQUEST_INTERVAL_MS = 250
const MIN_HAND_FRAME_SHARE = 0.4
const HEALTH_TIMEOUT_MS = 2500

const round = (v) => Math.round(v * 1e4) / 1e4

function toFrame(results) {
  const hands = (results.multiHandLandmarks || []).map((landmarks, i) => ({
    landmarks: landmarks.map((p) => [round(p.x), round(p.y), round(p.z ?? 0)]),
    handedness: results.multiHandedness?.[i]?.label ?? null,
    score: results.multiHandedness?.[i]?.score ?? 1
  }))
  const pose = results.poseLandmarks
    ? results.poseLandmarks.map((p) => [round(p.x), round(p.y), round(p.z ?? 0), round(p.visibility ?? 1)])
    : null
  return { t: performance.now(), hands, pose }
}

function evenlySpaced(items, maxCount) {
  if (items.length <= maxCount) return items
  const step = (items.length - 1) / (maxCount - 1)
  return Array.from({ length: maxCount }, (_, i) => items[Math.round(i * step)])
}

class SignRecognizer {
  constructor() {
    this.status = MODE === 'off' ? 'disabled' : 'idle' // idle | checking | online | offline | disabled
    this.info = null
    this.error = null
    this.frames = []
    this.size = { width: 640, height: 480 }
    this.inFlight = false
    this.lastRequestAt = 0
    this.onPrediction = null
    this.onStatusChange = null
  }

  _setStatus(status, error = null) {
    this.status = status
    this.error = error
    this.onStatusChange?.({ status, info: this.info, error })
  }

  /** Checks the backend once; call again to retry after starting the backend. */
  async connect() {
    if (MODE === 'off') {
      this._setStatus('disabled')
      return this.status
    }
    this._setStatus('checking')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      const health = await response.json()
      this.info = health
      if (health.model_loaded) this._setStatus('online')
      else this._setStatus('offline', health.error || 'The backend is running but no model is loaded.')
    } catch {
      this._setStatus('offline', `Recognition server not reachable at ${API_BASE_URL}. Start it with start_all.bat.`)
    } finally {
      clearTimeout(timer)
    }
    return this.status
  }

  reset() {
    this.frames = []
  }

  /** Feed every tracker result; requests are throttled and skipped without hands. */
  addFrame(results) {
    if (this.status !== 'online') return
    if (results.width && results.height) this.size = { width: results.width, height: results.height }

    const now = performance.now()
    this.frames.push(toFrame(results))
    while (this.frames.length && now - this.frames[0].t > WINDOW_MS) this.frames.shift()

    if (this.inFlight || now - this.lastRequestAt < REQUEST_INTERVAL_MS || this.frames.length < MIN_FRAMES) return
    const handShare = this.frames.filter((f) => f.hands.length > 0).length / this.frames.length
    if (handShare < MIN_HAND_FRAME_SHARE) return

    this.lastRequestAt = now
    this._predict(evenlySpaced(this.frames, MAX_FRAMES_SENT))
  }

  async _predict(frames) {
    this.inFlight = true
    const started = performance.now()
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: frames.map(({ hands, pose }) => ({ hands, pose })),
          width: this.size.width,
          height: this.size.height,
          mirrored: false,
          top_k: 3
        })
      })
      if (!response.ok) throw new Error(`Recognition request failed (${response.status})`)
      const prediction = await response.json()
      prediction.roundTripMs = Math.round(performance.now() - started)
      this.onPrediction?.(prediction)
    } catch (error) {
      this._setStatus('offline', error.message || 'Recognition server stopped responding.')
    } finally {
      this.inFlight = false
    }
  }
}

export const signRecognizer = new SignRecognizer()
export default signRecognizer
