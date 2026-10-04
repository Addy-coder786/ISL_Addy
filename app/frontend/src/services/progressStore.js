/**
 * MUDRA Practice Progress Store
 *
 * Persists real practice sessions on this device only (localStorage).
 * Nothing here is uploaded. Every number shown on the Progress page is
 * derived from these recorded sessions — no placeholder values.
 */

const STORAGE_KEY = 'mudra.practice.sessions.v1'
const MAX_SESSIONS = 500
const MIN_SESSION_SAMPLES = 15 // ~0.5 s of tracked hand frames before a session counts
export const MASTERY_THRESHOLD = 80

function readSessions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(sessions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS)))
    return true
  } catch {
    return false
  }
}

/**
 * Accumulates per-frame similarity scores for one sign while the camera runs.
 * Call add() per evaluated frame and flush() when the sign changes or the camera stops.
 */
export function createSessionRecorder() {
  let current = null

  return {
    add(signId, similarity) {
      if (!current || current.signId !== signId) {
        this.flush()
        current = { signId, startedAt: Date.now(), samples: 0, sum: 0, best: 0 }
      }
      current.samples += 1
      current.sum += similarity
      current.best = Math.max(current.best, similarity)
      current.lastAt = Date.now()
    },

    flush() {
      if (!current || current.samples < MIN_SESSION_SAMPLES) {
        current = null
        return null
      }
      const session = {
        signId: current.signId,
        startedAt: current.startedAt,
        durationMs: Math.max(0, (current.lastAt || Date.now()) - current.startedAt),
        samples: current.samples,
        avgSimilarity: Math.round(current.sum / current.samples),
        bestSimilarity: Math.round(current.best)
      }
      current = null
      writeSessions([...readSessions(), session])
      return session
    }
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

function dayKey(timestamp) {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Consecutive days (ending today or yesterday) with at least one session. */
function computeStreak(sessions) {
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)))
  const cursor = new Date()
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Aggregates recorded sessions into the summary shown on the Progress page. */
export function getProgressSummary() {
  const sessions = readSessions()
  const bySign = new Map()

  for (const s of sessions) {
    const entry = bySign.get(s.signId) || { signId: s.signId, sessions: 0, best: 0, avgSum: 0, lastAt: 0 }
    entry.sessions += 1
    entry.best = Math.max(entry.best, s.bestSimilarity)
    entry.avgSum += s.avgSimilarity
    entry.lastAt = Math.max(entry.lastAt, s.startedAt)
    bySign.set(s.signId, entry)
  }

  const signs = [...bySign.values()].map((e) => ({
    signId: e.signId,
    sessions: e.sessions,
    bestSimilarity: e.best,
    avgSimilarity: Math.round(e.avgSum / e.sessions),
    lastAt: e.lastAt
  }))

  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0)

  return {
    hasData: sessions.length > 0,
    sessionCount: sessions.length,
    totalPracticeMinutes: Math.round(totalMs / 60000),
    streakDays: computeStreak(sessions),
    signs,
    averageBestSimilarity: signs.length
      ? Math.round(signs.reduce((sum, s) => sum + s.bestSimilarity, 0) / signs.length)
      : 0,
    strongSigns: signs.filter((s) => s.bestSimilarity >= MASTERY_THRESHOLD).sort((a, b) => b.bestSimilarity - a.bestSimilarity),
    needsPracticeSigns: signs.filter((s) => s.bestSimilarity < MASTERY_THRESHOLD).sort((a, b) => a.bestSimilarity - b.bestSimilarity)
  }
}
