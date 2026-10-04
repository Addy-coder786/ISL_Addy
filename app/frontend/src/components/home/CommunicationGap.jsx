import React, { useEffect, useState } from 'react'
import { Hand, Volume2, Heart, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import { useAccessibility } from '../../context/AccessibilityContext'

export default function CommunicationGap({ onNavigate }) {
  const { reducedMotion } = useAccessibility()
  const [isBridged, setIsBridged] = useState(true)
  const [bridgeStage, setBridgeStage] = useState('flowing')

  useEffect(() => {
    if (reducedMotion) {
      setBridgeStage(isBridged ? 'flowing' : 'broken')
      return undefined
    }

    setBridgeStage(isBridged ? 'dissolving' : 'reversing')
    const timer = setTimeout(() => {
      setBridgeStage(isBridged ? 'flowing' : 'broken')
    }, 900)

    return () => clearTimeout(timer)
  }, [isBridged, reducedMotion])

  const handleToggle = (nextState) => {
    if (nextState !== isBridged) setIsBridged(nextState)
  }

  const isFlowing = bridgeStage === 'flowing'
  const showMeaning = isFlowing && isBridged

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-transparent via-mudra-lavender-50/40 to-transparent">
      
      <style>{`
        .communication-gap-stage {
          --bridge-transition: 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .communication-gap-stage .bridge-line,
        .communication-gap-stage .bridge-barrier,
        .communication-gap-stage .bridge-message,
        .communication-gap-stage .voice-wave,
        .communication-gap-stage .person-panel {
          transition: opacity var(--bridge-transition), transform var(--bridge-transition), color var(--bridge-transition), background-color var(--bridge-transition), border-color var(--bridge-transition), box-shadow var(--bridge-transition);
        }
        .communication-gap-stage .bridge-line {
          vector-effect: non-scaling-stroke;
        }
        .communication-gap-stage .bridge-map-vertical {
          display: none;
        }
        .communication-gap-stage .bridge-broken {
          stroke-dasharray: 2 10;
          opacity: 1;
        }
        .communication-gap-stage .bridge-flow {
          stroke-dasharray: 12 14;
          opacity: 0;
        }
        .communication-gap-stage .bridge-flow,
        .communication-gap-stage .bridge-pulse {
          animation: bridge-flow 2.8s linear infinite;
        }
        .communication-gap-stage .bridge-pulse {
          opacity: 0;
        }
        .communication-gap-stage .bridge-barrier {
          opacity: 1;
          transform: scale(1);
          transform-origin: center;
        }
        .communication-gap-stage .voice-wave {
          opacity: 0;
          transform: translateX(-4px);
        }
        .communication-gap-stage[data-stage='flowing'] .bridge-broken,
        .communication-gap-stage[data-stage='dissolving'] .bridge-broken,
        .communication-gap-stage[data-stage='reversing'] .bridge-broken {
          opacity: 0;
        }
        .communication-gap-stage[data-stage='flowing'] .bridge-flow,
        .communication-gap-stage[data-stage='dissolving'] .bridge-flow,
        .communication-gap-stage[data-stage='flowing'] .bridge-pulse,
        .communication-gap-stage[data-stage='dissolving'] .bridge-pulse {
          opacity: 1;
        }
        .communication-gap-stage[data-stage='flowing'] .bridge-barrier,
        .communication-gap-stage[data-stage='dissolving'] .bridge-barrier,
        .communication-gap-stage[data-stage='reversing'] .bridge-barrier {
          opacity: 0;
          transform: scale(0.5);
        }
        .communication-gap-stage[data-stage='flowing'] .voice-wave {
          opacity: 1;
          transform: translateX(0);
        }
        .communication-gap-stage[data-stage='reversing'] .bridge-flow,
        .communication-gap-stage[data-stage='reversing'] .bridge-pulse {
          opacity: 0;
        }
        @keyframes bridge-flow {
          to { stroke-dashoffset: -52; }
        }
        @keyframes voice-wave {
          0%, 100% { transform: scaleY(0.45); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .communication-gap-stage .voice-wave span {
          transform-origin: center;
          animation: voice-wave 1.35s ease-in-out infinite;
        }
        .communication-gap-stage .voice-wave span:nth-child(2) { animation-delay: 120ms; }
        .communication-gap-stage .voice-wave span:nth-child(3) { animation-delay: 240ms; }
        .communication-gap-stage .voice-wave span:nth-child(4) { animation-delay: 360ms; }
        @media (prefers-reduced-motion: reduce) {
          .communication-gap-stage .bridge-flow,
          .communication-gap-stage .bridge-pulse,
          .communication-gap-stage .voice-wave span {
            animation: none;
          }
        }
        @media (max-width: 767px) {
          .communication-gap-stage .bridge-map:not(.bridge-map-vertical) {
            display: none;
          }
          .communication-gap-stage .bridge-map-vertical {
            display: block;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mudra-peach-100 border border-mudra-peach-300 text-mudra-peach-warm text-xs font-semibold tracking-wide">
            <Heart className="w-3.5 h-3.5 text-mudra-peach-500 fill-mudra-peach-500" />
            <span>Bridging Two Worlds</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-mudra-indigo-900 tracking-tight leading-tight">
            Different ways of communicating <br className="hidden sm:inline" />
            shouldn't create <span className="text-gradient">invisible walls.</span>
          </h2>

          <p className="text-mudra-indigo-600/80 text-base sm:text-lg max-w-2xl mx-auto">
            18 million Deaf and hard-of-hearing individuals in India express themselves using sign language. MUDRA dissolves the silent divide.
          </p>

          {/* Interactive Bridge Toggle Switch */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/80 border border-mudra-lavender-300 shadow-sm">
              <button
                type="button"
                onClick={() => handleToggle(false)}
                aria-pressed={!isBridged}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  !isBridged ? 'bg-mudra-indigo-900 text-white shadow-sm' : 'text-mudra-indigo-700 hover:bg-mudra-lavender-50'
                }`}
              >
                WITHOUT MUDRA
              </button>
              <button
                type="button"
                onClick={() => handleToggle(true)}
                aria-pressed={isBridged}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isBridged ? 'bg-mudra-lavender-600 text-white shadow-sm' : 'text-mudra-indigo-700 hover:bg-mudra-lavender-50'
                }`}
              >
                WITH MUDRA
              </button>
            </div>
          </div>
        </div>

        {/* Visual Metaphor Interactive Stage */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-5 sm:p-8 relative overflow-hidden border border-white shadow-xl bg-white/70 backdrop-blur-md">
            <div
              className="communication-gap-stage grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] gap-5 sm:gap-8 items-center relative"
              data-stage={bridgeStage}
            >
              
              {/* Left Column: Signer */}
              <div className={`person-panel p-5 sm:p-6 rounded-2xl border ${isFlowing ? 'bg-mudra-lavender-50 border-mudra-lavender-300 shadow-md' : 'bg-mudra-indigo-50 border-mudra-indigo-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${isFlowing ? 'bg-mudra-lavender-600 text-white' : 'bg-mudra-indigo-200 text-mudra-indigo-700'}`}>
                  <Hand className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-mudra-lavender-700 uppercase tracking-wider mb-1 font-display">
                  Visual Expression
                </div>
                <h3 className="font-display font-bold text-lg text-mudra-indigo-900 mb-2">
                  Deaf Signer
                </h3>
                <p className="text-xs text-mudra-indigo-650 leading-relaxed mb-4">
                  Uses rich spatial hand gestures, facial expressions, and dynamics to communicate.
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-mudra-lavender-100 text-xs font-semibold text-mudra-indigo-900 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isFlowing ? 'bg-mudra-lavender-500' : 'bg-gray-300'}`}></span>
                  <span>Signs: <strong className="text-mudra-lavender-700">Your meaning</strong></span>
                </div>
              </div>

              {/* Center Column: Animated Bridge */}
              <div className="relative flex min-h-[180px] items-center justify-center py-3 md:min-h-[220px] md:py-0">
                <svg className="bridge-map absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 320 160" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <filter id="bridge-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <path id="bridge-horizontal-path" d="M 16 80 C 90 26, 230 134, 304 80" />
                    <path id="bridge-vertical-path" d="M 160 12 C 220 48, 100 112, 160 148" />
                  </defs>
                  <path className="bridge-line bridge-broken" d="M 16 80 C 90 26, 230 134, 304 80" fill="none" stroke="#6B609E" strokeWidth="3" strokeLinecap="round" />
                  <path className="bridge-line bridge-flow" d="M 16 80 C 90 26, 230 134, 304 80" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" filter="url(#bridge-glow)" />
                  <circle className="bridge-pulse" r="5" fill="#FDBA74" filter="url(#bridge-glow)"><animateMotion dur="2.8s" repeatCount="indefinite"><mpath href="#bridge-horizontal-path" /></animateMotion></circle>
                  <g className="bridge-barrier" transform="translate(160 80)">
                    <circle r="17" fill="#FFF8F1" stroke="#E7A08B" strokeWidth="2" />
                    <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
                <svg className="bridge-map bridge-map-vertical absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 320 160" preserveAspectRatio="none" aria-hidden="true">
                  <path className="bridge-line bridge-broken" d="M 160 12 C 220 48, 100 112, 160 148" fill="none" stroke="#6B609E" strokeWidth="3" strokeLinecap="round" />
                  <path className="bridge-line bridge-flow" d="M 160 12 C 220 48, 100 112, 160 148" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" filter="url(#bridge-glow)" />
                  <circle className="bridge-pulse" r="5" fill="#FDBA74" filter="url(#bridge-glow)"><animateMotion dur="2.8s" repeatCount="indefinite"><mpath href="#bridge-vertical-path" /></animateMotion></circle>
                  <g className="bridge-barrier" transform="translate(160 80)">
                    <circle r="17" fill="#FFF8F1" stroke="#E7A08B" strokeWidth="2" />
                    <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
                <div className="bridge-message relative z-10 mt-28 flex flex-col items-center gap-2 text-center md:mt-32">
                  <span className={`text-xs font-bold uppercase tracking-[0.16em] ${showMeaning ? 'text-mudra-lavender-700' : 'text-rose-700'}`}>
                    {showMeaning ? 'Meaning connected' : 'Connection interrupted'}
                  </span>
                  <strong className="font-display text-base text-mudra-indigo-900 sm:text-lg">
                    {showMeaning ? 'Your meaning finds a voice.' : 'Your sign stays unheard.'}
                  </strong>
                  <div className={`voice-wave flex h-7 items-center gap-1 ${showMeaning ? '' : 'pointer-events-none'}`} aria-hidden="true">
                    {[1, 2, 3, 4].map((bar) => <span key={bar} className="h-5 w-1 rounded-full bg-mudra-peach-500" />)}
                  </div>
                </div>
              </div>

              {/* Right Column: Hearing Friend */}
              <div className={`person-panel p-5 sm:p-6 rounded-2xl border ${isFlowing ? 'bg-mudra-peach-50 border-mudra-peach-300 shadow-md' : 'bg-mudra-indigo-50 border-mudra-indigo-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${isFlowing ? 'bg-mudra-peach-500 text-white' : 'bg-mudra-indigo-200 text-mudra-indigo-650'}`}>
                  <Volume2 className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-mudra-peach-warm uppercase tracking-wider mb-1 font-display">
                  Auditory Translation
                </div>
                <h3 className="font-display font-bold text-lg text-mudra-indigo-900 mb-2">
                  Hearing Recipient
                </h3>
                <p className="text-xs text-mudra-indigo-650 leading-relaxed mb-4">
                  Hears or reads the translated sign naturally in their spoken language.
                </p>

                <div className="p-2 rounded-xl bg-white border border-mudra-peach-200 text-xs font-semibold text-mudra-indigo-900 min-h-[40px] flex flex-col justify-center">
                  {showMeaning ? (
                    <div className="space-y-1">
                      <div className="font-semibold text-mudra-peach-warm text-[10px] uppercase font-mono tracking-wider">
                        Speech Out
                      </div>
                      <div className="font-bold text-mudra-indigo-950">
                        "Hello, nice to meet you!"
                      </div>
                      {/* Voice wave micro-animation */}
                      <div className="flex items-center gap-0.5 h-3 pt-1">
                        <span className="w-0.5 bg-mudra-lavender-500 rounded-full animate-wave [animation-delay:0.1s]"></span>
                        <span className="w-0.5 bg-mudra-peach-500 rounded-full animate-wave [animation-delay:0.3s]"></span>
                        <span className="w-0.5 bg-mudra-lavender-600 rounded-full animate-wave [animation-delay:0.5s]"></span>
                        <span className="w-0.5 bg-mudra-gold-500 rounded-full animate-wave [animation-delay:0.2s]"></span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-mudra-indigo-400 italic font-medium">Waiting to receive meaning...</span>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Insight Quote */}
            <div className="mt-8 pt-6 border-t border-mudra-lavender-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  showMeaning ? 'bg-emerald-100 text-emerald-800' : 'bg-mudra-lavender-100 text-mudra-lavender-700'
                }`}>
                  {showMeaning ? '✓' : '•'}
                </div>
                <p className="text-xs sm:text-sm text-mudra-indigo-700 font-medium">
                  <strong>MUDRA is dual-sided:</strong> Deaf users express visual thoughts natively, while hearing users listen and learn with empathy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('communicate')}
                className="text-xs font-bold text-mudra-lavender-700 hover:text-mudra-lavender-900 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Experience Real-Time Bridge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
