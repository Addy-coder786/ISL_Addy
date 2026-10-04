import React, { useState, useRef, useEffect } from 'react'

/**
 * MUDRA Cinematic Brand Preloader
 * 
 * - Plays mudra-intro.mp4 from the beginning
 * - Stops playback at CLEAN_STOP_TIME (before the fake generated website appears)
 * - Holds on the final MUDRA brand frame briefly, then fades into the real homepage
 * - Never shows a black screen: background matches video dark-to-warm transition
 * - Plays only once per session (controlled by parent via sessionStorage)
 */

// Stop video here — clean MUDRA brand reveal frame BEFORE fake website appears (~8s mark)
const CLEAN_STOP_TIME = 8.0

export default function IntroLoader({ onComplete }) {
  const videoRef = useRef(null)
  const [phase, setPhase] = useState('playing') // 'playing' | 'holding' | 'fading'

  const triggerTransition = () => {
    if (phase !== 'playing') return
    setPhase('holding')

    // Hold clean brand frame for 500ms, then fade out into real homepage
    setTimeout(() => {
      setPhase('fading')
      // After fade completes, hand off to parent
      setTimeout(() => {
        onComplete()
      }, 700)
    }, 500)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true

    // Start playback
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true
        video.play().catch(() => {})
      })
    }

    // Poll for the clean stop point every animation frame
    // This is more reliable than ontimeupdate for sub-second precision
    let rafId
    const checkTime = () => {
      if (!video) return
      if (video.currentTime >= CLEAN_STOP_TIME) {
        video.pause()
        triggerTransition()
        return
      }
      rafId = requestAnimationFrame(checkTime)
    }
    rafId = requestAnimationFrame(checkTime)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // If video ends before CLEAN_STOP_TIME (very short clip), still transition cleanly
  const handleEnded = () => {
    triggerTransition()
  }

  // Skip: immediately jump to transition
  const handleSkip = () => {
    if (videoRef.current) videoRef.current.pause()
    triggerTransition()
  }

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden transition-all ease-in-out ${
        phase === 'fading'
          ? 'opacity-0 scale-[1.03] pointer-events-none duration-700'
          : phase === 'holding'
          ? 'opacity-100 scale-100 duration-300'
          : 'opacity-100 scale-100 duration-300'
      }`}
      // Background matches the warm ivory of the real homepage for a seamless hand-off
      style={{ backgroundColor: '#1a1428' }}
      aria-label="MUDRA brand transition preloader"
    >
      <style>{`
        .mudra-intro-video {
          object-position: center center;
        }
        @media (max-width: 767px) {
          .mudra-intro-video {
            object-fit: contain;
            object-position: 50% 42%;
          }
        }
      `}</style>
      {/* Fullscreen cinematic video — no controls, no borders, object-cover */}
      <video
        ref={videoRef}
        src="/assets/mudra-intro.mp4"
        className="mudra-intro-video absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        playsInline
        autoPlay
        muted
        preload="auto"
        onEnded={handleEnded}
      />

      {/* Subtle Skip control — only visible during playback, fades with holding/fading phases */}
      <button
        type="button"
        onClick={handleSkip}
        className={`absolute bottom-7 right-7 z-20 px-4 py-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white/50 hover:text-white/90 text-xs font-mono tracking-widest uppercase transition-all border border-white/10 hover:border-white/25 ${
          phase !== 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Skip intro transition"
      >
        Skip →
      </button>
    </div>
  )
}
