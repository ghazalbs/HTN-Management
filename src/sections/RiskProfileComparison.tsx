import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { SectionHeader } from '../components/SectionHeader'
import { InterpretationBox } from '../components/InterpretationBox'
import { TooltipLabel } from '../components/TooltipLabel'
import type { RiskProfileRow } from '../types'
import { STRATEGY_ORDER, STRATEGY_LABELS } from '../utils/calculations'

interface Props {
  profiles: RiskProfileRow[]
}

// Color palette: female = warmer, male = cooler; line style by risk type
const PROFILE_STYLES: Record<string, { color: string; dash?: string }> = {
  'Female_Risk-Free': { color: '#f87171', dash: '0' },
  'Female_Smoking':   { color: '#ef4444', dash: '5 3' },
  'Female_Diabetic':  { color: '#b91c1c', dash: '2 2' },
  'Male_Risk-Free':   { color: '#60a5fa', dash: '0' },
  'Male_Smoking':     { color: '#2563eb', dash: '5 3' },
  'Male_Diabetic':    { color: '#1e40af', dash: '2 2' },
}

const NVI_COL_MAP: Record<string, keyof RiskProfileRow> = {
  KF: 'NVI_KF',
  SIL_DeltaStar: 'NVI_DeltaStar',
  SIL_DeltaL: 'NVI_DeltaL',
  SIL_DeltaH: 'NVI_DeltaH',
}

export function RiskProfileComparison({ profiles }: Props) {
  // Build wide-format chart data with one row per strategy
  const chartData = STRATEGY_ORDER.map((strat) => {
    const row: Record<string, string | number> = { strategy: STRATEGY_LABELS[strat] }
    for (const p of profiles) {
      const nvi = p[NVI_COL_MAP[strat]] as number
      row[p.Profile] = parseFloat((nvi * 100).toFixed(2))
    }
    return row
  })

  const allProfiles = profiles.map((p) => p.Profile)

  return (
    <section className="mb-12">
      <SectionHeader
        id="risk-profiles"
        title="Risk Profile Learning Strategy Comparison"
        badge="5"
        subtitle="NVI (%) for each risk profile across four learning strategies. Higher NVI = more value left unrealized under that learning rule."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-4">
        <div className="mb-3 text-xs text-gray-500 space-y-1">
          <p>
            <strong>Strategy order:</strong>{' '}
            <TooltipLabel term="KF">KF</TooltipLabel> → <TooltipLabel term="SIL-Δ*">SIL-Δ*</TooltipLabel> → <TooltipLabel term="SIL-ΔL">SIL-ΔL</TooltipLabel> → <TooltipLabel term="SIL-ΔH">SIL-ΔH</TooltipLabel>
          </p>
          <p>Solid lines = Risk-Free; dashed lines = Smoking; dotted lines = Diabetic. Red = Female; Blue = Male.</p>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData} margin={{ top: 10, right: 100, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="strategy" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
              label={{ value: 'NVI (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {allProfiles.map((profile) => {
              const style = PROFILE_STYLES[profile] ?? { color: '#9ca3af' }
              return (
                <Line
                  key={profile}
                  type="monotone"
                  dataKey={profile}
                  stroke={style.color}
                  strokeDasharray={style.dash}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <InterpretationBox
        lines={[
          'KF is the unbiased learning benchmark. SIL-Δ* should be close to KF when the surprise threshold is well calibrated.',
          'SIL-ΔL represents overreacting to new readings; SIL-ΔH represents overcommitment to prior beliefs (inertia-like updating).',
          'NVI is largest under SIL-ΔH, especially for high-risk profiles (Male Smoking, Male Diabetic).',
        ]}
        variant="insight"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          'Calibrated updating matters. The goal is not to always react or never react; the goal is to identify when a BP reading is meaningfully informative.',
          'Inertia-like updating (SIL-ΔH) is especially costly for high-risk profiles.',
          'Decision support should help physicians distinguish meaningful BP changes from random fluctuations.',
          'Even under KF, NVI remains positive, indicating that better learning alone cannot fully eliminate losses from noisy BP measurement.',
        ].map((rec, i) => (
          <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-navy-800">{i + 1}. </span>{rec}
          </div>
        ))}
      </div>
    </section>
  )
}
