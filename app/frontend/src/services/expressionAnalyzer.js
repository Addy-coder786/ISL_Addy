const TONES = {
  friendly: {
    label: 'Friendly & Warm',
    emoji: '😊',
    reason: 'Strong smile cues with relaxed facial posture'
  },
  excited: {
    label: 'Happy / Excited',
    emoji: '😄',
    reason: 'Smile, eye openness, and jaw openness suggest energetic cues'
  },
  calm: {
    label: 'Calm',
    emoji: '😌',
    reason: 'Low facial activity suggests relaxed cues'
  },
  respectful: {
    label: 'Respectful',
    emoji: '🙏',
    reason: 'Measured facial posture with low tension cues'
  },
  affectionate: {
    label: 'Affectionate',
    emoji: '❤️',
    reason: 'Gentle smile cues with relaxed facial posture'
  },
  sad: {
    label: 'Sad',
    emoji: '😔',
    reason: 'Frown and inner-brow cues suggest a subdued expression'
  },
  concerned: {
    label: 'Concerned',
    emoji: '😟',
    reason: 'Brow and mouth-tension cues suggest concern'
  },
  frustrated: {
    label: 'Angry',
    emoji: '😠',
    reason: 'Calibrated brow, eye, and mouth-tension cues suggest an angry expression'
  },
  surprised: {
    label: 'Surprised',
    emoji: '😲',
    reason: 'Raised brows, wide eyes, and jaw openness suggest surprise cues'
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    reason: 'No strong facial-expression pattern was detected'
  }
}

const value = (scores, name) => scores.get(name) || 0
const average = (scores, names) => {
  const available = names.filter((name) => scores.has(name))
  return available.length ? available.reduce((sum, name) => sum + value(scores, name), 0) / available.length : 0
}
const clamp = (number, min, max) => Math.min(max, Math.max(min, number))

function toScoreMap(categories = []) {
  return new Map(
    categories
      .filter((category) => category?.categoryName && Number.isFinite(category.score))
      .map((category) => [category.categoryName, category.score])
  )
}

/**
 * Converts actual MediaPipe blendshape categories into a transparent tone estimate.
 * This service is independent of React, ISL tokens, sentence generation, and speech.
 */
export function analyzeExpression(categories = []) {
  const scores = toScoreMap(categories)
  if (!scores.size) {
    return {
      tone: 'neutral',
      ...TONES.neutral,
      confidence: 0,
      available: false,
      reason: 'Insufficient expressive cues'
    }
  }

  const smile = average(scores, ['mouthSmileLeft', 'mouthSmileRight'])
  const frown = average(scores, ['mouthFrownLeft', 'mouthFrownRight'])
  const browDown = average(scores, ['browDownLeft', 'browDownRight'])
  const browRaised = average(scores, ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'])
  const browInner = average(scores, ['browInnerUp', 'browInnerUpLeft', 'browInnerUpRight'])
  const browOuter = average(scores, ['browOuterUpLeft', 'browOuterUpRight'])
  const eyeWide = average(scores, ['eyeWideLeft', 'eyeWideRight'])
  const eyeSquint = average(scores, ['eyeSquintLeft', 'eyeSquintRight'])
  const eyeLookOut = average(scores, ['eyeLookOutLeft', 'eyeLookOutRight'])
  const eyeLookDown = average(scores, ['eyeLookDownLeft', 'eyeLookDownRight'])
  const jawOpen = value(scores, 'jawOpen')
  const mouthPress = average(scores, ['mouthPressLeft', 'mouthPressRight'])
  const mouthShrugLower = value(scores, 'mouthShrugLower')
  const noseSneer = average(scores, ['noseSneerLeft', 'noseSneerRight'])
  const activity = [smile, frown, browDown, browRaised, eyeWide, jawOpen, mouthPress]
    .reduce((sum, score) => sum + score, 0) / 7
  const strongestCue = Math.max(smile, frown, browDown, browRaised, eyeWide, jawOpen, mouthPress)
  const relaxed = 1 - clamp(browDown + mouthPress, 0, 1)

  // Calibration anchors from this camera/model's observed expressions.
  const sadScore = clamp(
    mouthShrugLower / 0.24 * 0.36 +
      eyeSquint / 0.30 * 0.24 +
      browOuter / 0.14 * 0.18 +
      eyeLookOut / 0.34 * 0.12 +
      eyeLookDown / 0.13 * 0.10 -
      browInner / 0.78 * 0.5 -
      smile / 0.55 * 0.42,
    0,
    1
  )
  const angryScore = clamp(
    browInner / 0.78 * 0.42 +
      browOuter / 0.57 * 0.24 +
      eyeLookDown / 0.26 * 0.14 +
      mouthPress / 0.12 * 0.10 +
      mouthShrugLower / 0.24 * 0.05 +
      noseSneer / 0.3 * 0.05 -
      smile / 0.55 * 0.35,
    0,
    1
  )

  const candidates = {
    friendly: smile * 0.65 + relaxed * 0.2 + activity * 0.15,
    excited: smile * 0.32 + jawOpen * 0.25 + eyeWide * 0.23 + activity * 0.2,
    calm: (1 - strongestCue) * 0.72 + (1 - activity) * 0.28,
    // These two tones stay conservative until stronger contextual cues are added.
    respectful: 0.08 + relaxed * 0.08,
    affectionate: smile * 0.38 + relaxed * 0.08,
    sad: sadScore,
    concerned: browRaised * 0.38 + frown * 0.32 + mouthPress * 0.3,
    frustrated: angryScore,
    surprised: browRaised * 0.3 + eyeWide * 0.38 + jawOpen * 0.32,
    neutral: (1 - activity) * 0.7 + (1 - Math.abs(smile - frown)) * 0.3
  }

  const ranked = Object.entries(candidates).sort((a, b) => b[1] - a[1])
  const happyScore = candidates.friendly
  const neutralScore = candidates.neutral
  const smileIsStrong = smile >= 0.55 && happyScore >= neutralScore
  const angryIsStrong = angryScore >= 0.52 && angryScore > sadScore + 0.08
  const sadIsStrong = sadScore >= 0.68 && sadScore > angryScore + 0.15
  const tone = smileIsStrong
    ? 'friendly'
    : angryIsStrong
    ? 'frustrated'
    : sadIsStrong
    ? 'sad'
    : 'neutral'
  const topScore = candidates[tone]
  const secondScore = ranked[1]?.[1] || 0
  const categoryCoverage = clamp(scores.size / 8, 0, 1)
  const separation = clamp(topScore - secondScore, 0, 1)
  const confidence = clamp(0.42 + topScore * 0.28 + separation * 0.2 + categoryCoverage * 0.1, 0, 0.86)
  const definition = TONES[tone]

  return {
    tone,
    ...definition,
    confidence,
    available: confidence >= 0.48,
    reason: definition.reason
  }
}

export const INITIAL_EXPRESSION = {
  tone: 'neutral',
  ...TONES.neutral,
  confidence: 0,
  available: false,
  reason: 'Start the camera to analyze expression'
}

export const FACE_UNAVAILABLE_EXPRESSION = {
  tone: 'neutral',
  ...TONES.neutral,
  confidence: 0,
  available: false,
  reason: 'Face not detected'
}
