import React, { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles
} from 'lucide-react'
import MudraAvatarViewer from '../avatar/MudraAvatarViewer'

export default function Hero({ onNavigate }) {
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [voiceVisible, setVoiceVisible] = useState(false)

  useEffect(() => {
    // Sequence timings:
    // 1. Headline softly appears immediately on mount (handled via CSS animation)

    // 2. Avatar fades/scales into view
    const timerAvatar = setTimeout(() => {
      setAvatarVisible(true)
    }, 600)

    // 3. Avatar performs a subtle ISL animation automatically on load (signText="HELLO")

    // 4. Text appears beside/below it
    const timerText = setTimeout(() => {
      setTextVisible(true)
    }, 2000)

    // 5. A small voice-wave animation follows
    const timerVoice = setTimeout(() => {
      setVoiceVisible(true)
    }, 2800)

    return () => {
      clearTimeout(timerAvatar)
      clearTimeout(timerText)
      clearTimeout(timerVoice)
    }
  }, [])

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up-fade {
          animation: slideUpFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-1/12 w-72 h-72 rounded-full bg-gradient-to-tr from-mudra-lavender-300/20 to-mudra-lavender-100/10 blur-3xl animate-float-slow"></div>
        <div className="absolute top-48 right-1/12 w-80 h-80 rounded-full bg-gradient-to-br from-mudra-peach-300/15 to-mudra-peach-100/10 blur-3xl animate-float-reverse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Headline (Order 1 on Mobile, Left Column on Tablet/Desktop) */}
          <div className="md:col-span-6 md:col-start-1 md:row-start-1 order-1 text-center md:text-left space-y-6 animate-slide-up-fade">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mudra-lavender-100/90 border border-mudra-lavender-300/80 text-mudra-lavender-700 text-xs font-semibold tracking-wide shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-mudra-lavender-600 animate-ping"></span>
              <span>AI-POWERED INDIAN SIGN LANGUAGE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-mudra-indigo-900 tracking-tight leading-[1.12]">
              COMMUNICATION <br className="hidden sm:inline" />
              SHOULD HAVE <br className="hidden sm:inline" />
              <span className="text-gradient">NO BARRIER.</span>
            </h1>
          </div>

          {/* Right Side: Avatar Visual Product Demonstration (Order 2 on Mobile, Right Column on Tablet/Desktop) */}
          <div 
            className={`md:col-span-6 md:col-start-7 md:row-start-1 md:row-span-2 order-2 w-full transition-all duration-1000 ease-out transform ${
              avatarVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-2xl relative border border-white/90 overflow-hidden space-y-4 bg-gradient-to-br from-white via-white to-mudra-lavender-50/50 max-w-lg mx-auto">
              
              {/* Card Label */}
              <div className="flex items-center justify-between pb-3 border-b border-mudra-lavender-200/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mudra-lavender-400 animate-pulse" />
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-mudra-indigo-600">
                    MUDRA AI GUIDE
                  </span>
                </div>
                <div className="text-[10px] text-mudra-indigo-400 font-semibold font-mono">
                  3D DEMO
                </div>
              </div>

              {/* 3D Avatar Stage */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-mudra-lavender-100 bg-gradient-to-b from-mudra-lavender-50/40 to-white">
                <MudraAvatarViewer
                  signText="HELLO"
                  className="w-full h-full border-none shadow-none"
                />
              </div>

              {/* Minimal Communication Flow: ISL SIGN -> MUDRA -> TEXT -> VOICE */}
              <div className="flex items-center justify-between gap-1 sm:gap-2 p-3 sm:p-4 rounded-2xl bg-mudra-ivory-100/70 border border-mudra-lavender-200/40 text-xs backdrop-blur-md shadow-xs">
                
                {/* ISL SIGN */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <span className="font-semibold text-mudra-indigo-500 text-[9px] sm:text-[10px] tracking-wider uppercase">ISL SIGN</span>
                  <span className="font-display font-bold text-xs sm:text-sm text-mudra-indigo-950 mt-1 flex items-center gap-1">
                    👋 HELLO
                  </span>
                </div>

                <span className="text-mudra-lavender-300 font-bold">&rarr;</span>

                {/* MUDRA */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <span className="font-semibold text-mudra-indigo-500 text-[9px] sm:text-[10px] tracking-wider uppercase">MUDRA AI</span>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Active
                  </span>
                </div>

                <span className="text-mudra-lavender-300 font-bold">&rarr;</span>

                {/* TEXT */}
                <div className={`flex flex-col items-center flex-1 text-center transition-all duration-750 ${
                  textVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
                }`}>
                  <span className="font-semibold text-mudra-indigo-500 text-[9px] sm:text-[10px] tracking-wider uppercase">TEXT</span>
                  <span className="font-display font-extrabold text-xs sm:text-sm text-mudra-indigo-950 mt-1">
                    "Hello"
                  </span>
                </div>

                <span className={`text-mudra-lavender-300 font-bold transition-opacity duration-750 ${textVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>&rarr;</span>

                {/* VOICE */}
                <div className={`flex flex-col items-center flex-1 text-center transition-all duration-750 ${
                  voiceVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
                }`}>
                  <span className="font-semibold text-mudra-indigo-500 text-[9px] sm:text-[10px] tracking-wider uppercase">VOICE</span>
                  <div className="flex items-center justify-center gap-0.5 h-4 mt-2">
                    <span className="w-0.5 bg-mudra-lavender-500 rounded-full animate-wave [animation-delay:0.1s]"></span>
                    <span className="w-0.5 bg-mudra-peach-500 rounded-full animate-wave [animation-delay:0.3s]"></span>
                    <span className="w-0.5 bg-mudra-lavender-600 rounded-full animate-wave [animation-delay:0.5s]"></span>
                    <span className="w-0.5 bg-mudra-gold-500 rounded-full animate-wave [animation-delay:0.2s]"></span>
                    <span className="w-0.5 bg-mudra-lavender-400 rounded-full animate-wave [animation-delay:0.4s]"></span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Supporting Copy + Buttons (Order 3 on Mobile, Left Column Row 2 on Tablet/Desktop) */}
          <div className="md:col-span-6 md:col-start-1 md:row-start-2 order-3 text-center md:text-left space-y-6 animate-slide-up-fade [animation-delay:0.2s] opacity-0 fill-mode-forwards">
            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-mudra-indigo-800 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
              "Every sign deserves to be understood."
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('communicate')}
                className="btn-primary w-full sm:w-auto px-8 py-4 text-sm font-bold tracking-wide uppercase shadow-lg shadow-mudra-lavender-600/20 cursor-pointer"
              >
                <span>START COMMUNICATING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="btn-secondary w-full sm:w-auto px-8 py-4 text-sm font-bold tracking-wide uppercase cursor-pointer"
              >
                <BookOpen className="w-4.5 h-4.5 text-mudra-lavender-600" />
                <span>EXPLORE LEARNING</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
