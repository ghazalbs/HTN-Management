import React, { useState } from 'react'
import { Info } from 'lucide-react'

const GLOSSARY: Record<string, string> = {
  NVI: 'Normalized Value of Information: NVI = (v_PI − v_j) / v_j. Measures the percentage improvement in expected QALYs from switching to perfect information, relative to the current learning strategy.',
  PI_scaled_loss:
    'Perfect-Information Scaled Loss: NVI / (1 + NVI) = (v_PI − v_j) / v_PI. The share of the perfect-information benchmark lost under the current strategy.',
  HF: 'Human/Updating Factor: O = optimal (minimum-bias) updating; L = low distortion; H = high updating distortion (e.g., anchoring to prior beliefs).',
  TF: 'Technology/Measurement Factor: L = low measurement noise; M = medium noise; H = high noise.',
  LBPV: 'Long-Term BP Variability: how much a patient\'s true underlying blood pressure fluctuates over time. L/M/H.',
  SBPV: 'Short-Term BP Variability: within-visit or short-window fluctuation in BP readings. L/M/H.',
  KF: 'Kalman Filter: an unbiased Bayesian learning rule that optimally combines prior beliefs with new noisy BP observations.',
  'SIL-Δ*':
    'Surprise-Sensitive Learning with optimally calibrated surprise threshold Δ*. Close to KF when well-tuned.',
  'SIL-ΔL':
    'Surprise-Sensitive Learning with low threshold ΔL = 0. Physician treats nearly every new reading as surprising; may overreact to recent observations.',
  'SIL-ΔH':
    'Surprise-Sensitive Learning with high threshold ΔH = ∞. Physician overcommits to prior beliefs; resembles inertia-like updating and underweights new BP readings.',
}

interface TooltipLabelProps {
  term: string
  children?: React.ReactNode
}

export function TooltipLabel({ term, children }: TooltipLabelProps) {
  const [visible, setVisible] = useState(false)
  const tip = GLOSSARY[term]
  if (!tip) return <>{children ?? term}</>

  return (
    <span className="relative inline-flex items-center gap-1">
      <span>{children ?? term}</span>
      <button
        className="text-gray-400 hover:text-navy-700 focus:outline-none"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label={`Definition of ${term}`}
      >
        <Info size={13} />
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg leading-relaxed pointer-events-none">
          <strong>{term}:</strong> {tip}
        </span>
      )}
    </span>
  )
}
