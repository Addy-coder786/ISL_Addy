import React from 'react'
import Hero from '../components/home/Hero'
import CommunicationGap from '../components/home/CommunicationGap'
import InteractivePipeline from '../components/home/InteractivePipeline'
import MultilingualShowcase from '../components/home/MultilingualShowcase'
import ContinuousLoop from '../components/home/ContinuousLoop'
import DeviceShowcase from '../components/home/DeviceShowcase'
import ImpactSection from '../components/home/ImpactSection'
import FinalCTA from '../components/home/FinalCTA'

export default function HomePage({ onNavigate }) {
  return (
    <div className="space-y-4">
      <Hero onNavigate={onNavigate} />
      <CommunicationGap onNavigate={onNavigate} />
      <InteractivePipeline onNavigate={onNavigate} />
      <MultilingualShowcase />
      <ContinuousLoop onNavigate={onNavigate} />
      <DeviceShowcase onNavigate={onNavigate} />
      <ImpactSection />
      <FinalCTA onNavigate={onNavigate} />
    </div>
  )
}
