import React from 'react'
import { ArrowRight, BookOpen, Sparkles, Heart } from 'lucide-react'

export default function FinalCTA({ onNavigate }) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Glow backdrop */}
        <div className="absolute -inset-4 bg-gradient-to-r from-mudra-lavender-500/15 via-mudra-peach-400/20 to-mudra-gold-400/15 rounded-3xl blur-2xl"></div>

        <div className="relative glass-card-indigo rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white border border-white/20 shadow-2xl overflow-hidden">
          
          {/* Subtle orbital ring illustration */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-white/10 opacity-40 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-white/10 opacity-40 pointer-events-none"></div>

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-mudra-peach-200 text-xs font-semibold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-mudra-peach-300" />
              <span>National Hackathon Prototype</span>
            </div>

            {/* Headline */}
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Let's make communication <br />
              <span className="bg-gradient-to-r from-mudra-peach-200 via-mudra-lavender-200 to-mudra-gold-200 bg-clip-text text-transparent">
                universal.
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-mudra-indigo-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Experience real-time AI recognition, interactive learning, and pose feedback designed to create an inclusive tomorrow.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('communicate')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-mudra-lavender-500 to-mudra-lavender-600 hover:from-mudra-lavender-400 hover:to-mudra-lavender-500 text-white font-bold text-base shadow-lg shadow-purple-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Try MUDRA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base backdrop-blur-md border border-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-mudra-peach-200" />
                <span>Start Learning</span>
              </button>
            </div>

            {/* Tagline */}
            <div className="pt-6 text-xs sm:text-sm font-semibold tracking-widest text-mudra-lavender-200 uppercase font-mono">
              Learn · Practice · Connect
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
