import React from 'react'
import { SectionHeader } from '../components/SectionHeader'

const TAKEAWAYS = [
  {
    num: 1,
    question: 'Which patients/settings are most sensitive?',
    text: 'Information distortions are most costly in scenarios combining high BP variability, high measurement noise, and high human updating distortion. In the risk-profile analysis, male smoking and male diabetic profiles show the largest NVI under biased updating.',
    color: 'border-red-400 bg-red-50',
    numColor: 'bg-red-400',
  },
  {
    num: 2,
    question: 'When is delay rational vs value-destroying?',
    text: 'Delay is not inherently suboptimal. It can be rational when it reflects calibrated learning under noisy observations. It becomes value-destroying when physicians underweight meaningful BP changes, represented by high-threshold surprise-sensitive learning (SIL-ΔH).',
    color: 'border-amber-400 bg-amber-50',
    numColor: 'bg-amber-400',
  },
  {
    num: 3,
    question: 'Where does better BP measurement matter most?',
    text: 'Better BP measurement is most valuable when NVI_KF is high, meaning that even unbiased learning from noisy observations leaves substantial value unrealized. These settings justify investment in better measurement procedures or technology.',
    color: 'border-blue-400 bg-blue-50',
    numColor: 'bg-blue-400',
  },
  {
    num: 4,
    question: 'When is reducing judgmental frictions not enough?',
    text: 'When technology-side loss remains high, improving physician updating alone cannot fully close the gap. In high-risk, high-noise settings, measurement improvement and decision support are complementary.',
    color: 'border-navy-400 bg-navy-50',
    numColor: 'bg-navy-800',
  },
]

export function ManagerialTakeaways() {
  return (
    <section className="mb-12">
      <SectionHeader
        id="takeaways"
        title="Reviewer-Facing Managerial Takeaways"
        badge="8"
        subtitle="Four key takeaways aligned with common reviewer questions about the model's practical implications."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {TAKEAWAYS.map((t) => (
          <div key={t.num} className={`rounded-lg border-l-4 p-5 shadow-sm ${t.color}`}>
            <div className="flex items-start gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${t.numColor}`}
              >
                {t.num}
              </span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">{t.question}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{t.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
