import React from 'react'
import { X, Eye, Zap, Type, Volume2, Check } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

export default function AccessibilityModal() {
  const {
    isModalOpen,
    setIsModalOpen,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
    speechRate,
    setSpeechRate
  } = useAccessibility()

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mudra-indigo-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mudra-lavender-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-mudra-lavender-100 flex items-center justify-center text-mudra-lavender-700">
              <Eye className="w-4 h-4" />
            </div>
            <h2 id="a11y-title" className="font-display font-bold text-xl text-mudra-indigo-900">
              Accessibility Settings
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-xl text-mudra-indigo-400 hover:text-mudra-indigo-900 hover:bg-mudra-lavender-50 transition-colors"
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-6 pt-5">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="contrast-toggle" className="font-semibold text-sm text-mudra-indigo-900 flex items-center gap-2 cursor-pointer">
                High Contrast Mode
              </label>
              <p className="text-xs text-mudra-indigo-500">
                Enhances text and border sharpness for maximum legibility
              </p>
            </div>
            <button
              id="contrast-toggle"
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? 'bg-mudra-lavender-600 justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs block"></span>
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="motion-toggle" className="font-semibold text-sm text-mudra-indigo-900 flex items-center gap-2 cursor-pointer">
                <Zap className="w-3.5 h-3.5 text-mudra-lavender-600" />
                Reduce Animations
              </label>
              <p className="text-xs text-mudra-indigo-500">
                Minimizes floating elements, orbits, and background transitions
              </p>
            </div>
            <button
              id="motion-toggle"
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                reducedMotion ? 'bg-mudra-lavender-600 justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs block"></span>
            </button>
          </div>

          {/* Text Sizing */}
          <div className="space-y-2">
            <label className="font-semibold text-sm text-mudra-indigo-900 flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-mudra-lavender-600" />
              Text Scaling
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Default' },
                { id: 'large', label: 'Large (+15%)' },
                { id: 'xlarge', label: 'X-Large (+30%)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    fontSize === opt.id
                      ? 'bg-mudra-lavender-600 text-white border-mudra-lavender-600 shadow-xs'
                      : 'bg-white/80 text-mudra-indigo-700 border-mudra-lavender-200 hover:bg-mudra-lavender-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="speech-rate-slider" className="font-semibold text-sm text-mudra-indigo-900 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-mudra-peach-500" />
                Text-to-Speech Speed
              </label>
              <span className="text-xs font-bold text-mudra-lavender-700 bg-mudra-lavender-100 px-2 py-0.5 rounded-full">
                {speechRate}x
              </span>
            </div>
            <input
              id="speech-rate-slider"
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-mudra-lavender-200 rounded-lg appearance-none cursor-pointer accent-mudra-lavender-600"
            />
            <div className="flex justify-between text-[10px] text-mudra-indigo-400 font-medium">
              <span>Slower (0.75x)</span>
              <span>Normal (1.0x)</span>
              <span>Faster (1.5x)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-mudra-lavender-200/60 flex justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="btn-primary py-2 px-5 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Apply Preferences</span>
          </button>
        </div>
      </div>
    </div>
  )
}
