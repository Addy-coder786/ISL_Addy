import React from 'react'
import { 
  Award, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp
} from 'lucide-react'

export default function ProgressPage({ onNavigate }) {
  const stats = [
    {
      title: 'Signs Learned',
      value: '24',
      subtitle: 'Out of 50 Foundations',
      icon: BookOpen,
      color: 'lavender'
    },
    {
      title: 'Average Accuracy',
      value: '87%',
      subtitle: '+4% this week',
      icon: Target,
      color: 'emerald'
    },
    {
      title: 'Practice Streak',
      value: '5 Days',
      subtitle: 'Keep it going! 🔥',
      icon: Flame,
      color: 'peach'
    },
    {
      title: 'Practice Time',
      value: '3.8 hrs',
      subtitle: '18 sessions total',
      icon: Clock,
      color: 'gold'
    }
  ]

  const strongSigns = [
    { name: 'HELLO', emoji: '👋', accuracy: 96, category: 'Greetings' },
    { name: 'WATER', emoji: '💧', accuracy: 94, category: 'Essentials' },
    { name: 'HELP', emoji: '🤟', accuracy: 92, category: 'Emergency' },
    { name: 'NAMASTE', emoji: '🙏', accuracy: 98, category: 'Greetings' }
  ]

  const needsImprovementSigns = [
    { name: 'THANK YOU', emoji: '✨', accuracy: 61, tip: 'Keep palm moving smoothly outward from chin' },
    { name: 'SORRY', emoji: '🤝', accuracy: 68, tip: 'Maintain circular rubbing motion on chest' },
    { name: 'PLEASE', emoji: '🤲', accuracy: 71, tip: 'Keep palm flat with gentle rotation' }
  ]

  const milestones = [
    { title: 'First 10 Signs Mastered', date: 'Earned 3 days ago', achieved: true, icon: '🌟' },
    { title: '5-Day Practice Streak', date: 'Earned today', achieved: true, icon: '🔥' },
    { title: 'Emergency Signs Certified', date: 'In progress (2/4)', achieved: false, icon: '🏥' },
    { title: 'Conversation Starter', date: 'Locked', achieved: false, icon: '💬' }
  ]

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-mudra-lavender-200/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mudra-lavender-100 text-mudra-lavender-700 text-xs font-bold font-mono mb-1">
            <Award className="w-3.5 h-3.5 text-mudra-lavender-600" />
            <span>STUDENT MASTERY DASHBOARD</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-mudra-indigo-900">
            Your ISL Learning Journey
          </h1>
          <p className="text-sm text-mudra-indigo-600 mt-1">
            Track your signed vocabulary, accuracy benchmarks, and personalized practice drills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('practice')}
          className="btn-primary py-2.5 px-5 text-xs font-bold"
        >
          <span>Continue Daily Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="glass-card rounded-3xl p-5 sm:p-6 border border-white shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-mudra-indigo-500 font-display">
                  {item.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-mudra-lavender-100 flex items-center justify-center text-mudra-lavender-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-mudra-indigo-950">
                {item.value}
              </div>
              <div className="text-[11px] text-mudra-indigo-500 font-medium">
                {item.subtitle}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mastery Breakdown: Strong Signs vs Needs Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Strong Signs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-mudra-lavender-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display font-bold text-lg text-mudra-indigo-900">
                  Strong Signs (90%+)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                4 Mastered
              </span>
            </div>

            <div className="space-y-3">
              {strongSigns.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/80 border border-mudra-lavender-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-display font-bold text-sm text-mudra-indigo-950">{s.name}</div>
                      <div className="text-[10px] text-mudra-indigo-500 font-medium">{s.category}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-emerald-600">{s.accuracy}%</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">High Mastery</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-mudra-lavender-200/60">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-bold text-lg text-mudra-indigo-900">
                  Needs Practice
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                3 Targeted
              </span>
            </div>

            <div className="space-y-3">
              {needsImprovementSigns.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{s.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-mudra-indigo-950">{s.name}</div>
                      <div className="text-[11px] text-mudra-indigo-600 truncate">{s.tip}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('practice')}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 shrink-0 transition-colors shadow-xs"
                  >
                    Drill Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Achievement Milestones */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-mudra-lavender-200/60">
          <h3 className="font-display font-bold text-xl text-mudra-indigo-900">
            Milestones & Badges
          </h3>
          <span className="text-xs font-mono text-mudra-indigo-500">ISL Certification Track</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                m.achieved
                  ? 'bg-gradient-to-br from-mudra-lavender-50 to-white border-mudra-lavender-300 shadow-xs'
                  : 'bg-mudra-ivory-100/60 border-mudra-lavender-200/60 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className="font-display font-bold text-sm text-mudra-indigo-950 mb-1">{m.title}</div>
              <div className="text-[11px] text-mudra-indigo-500 font-medium">{m.date}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
