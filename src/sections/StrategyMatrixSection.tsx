import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { SectionHeader } from '../components/SectionHeader'
import { InterpretationBox } from '../components/InterpretationBox'
import { DataTable } from '../components/DataTable'
import { TooltipLabel } from '../components/TooltipLabel'
import type { RiskProfileRow, ProfileDecomposition } from '../types'
import { computeProfileDecomposition, median } from '../utils/calculations'

interface Props {
  profiles: RiskProfileRow[]
}

const PROFILE_COLORS: Record<string, string> = {
  'Female_Risk-Free': '#f87171',
  'Female_Smoking': '#ef4444',
  'Female_Diabetic': '#b91c1c',
  'Male_Risk-Free': '#60a5fa',
  'Male_Smoking': '#2563eb',
  'Male_Diabetic': '#1e40af',
}

const columns = [
  { key: 'Profile', header: 'Profile', sortable: true },
  {
    key: 'Tech_loss_PI',
    header: <TooltipLabel term="NVI">Tech Loss (PI)</TooltipLabel>,
    render: (r: ProfileDecomposition) => `${(r.Tech_loss_PI * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'Human_loss_PI_DeltaStar',
    header: 'Human Loss (PI)',
    render: (r: ProfileDecomposition) => `${(r.Human_loss_PI_DeltaStar * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'Total_loss_PI_DeltaStar',
    header: 'Total Loss (PI, Δ*)',
    render: (r: ProfileDecomposition) => `${(r.Total_loss_PI_DeltaStar * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'Tech_share',
    header: 'Tech Share',
    render: (r: ProfileDecomposition) => `${(r.Tech_share * 100).toFixed(1)}%`,
    align: 'right' as const,
  },
  {
    key: 'Human_share',
    header: 'Human Share',
    render: (r: ProfileDecomposition) => `${(r.Human_share * 100).toFixed(1)}%`,
    align: 'right' as const,
  },
  { key: 'Strategy', header: 'Recommended Strategy', sortable: true },
]

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: ProfileDecomposition
}

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  if (!payload) return null
  const color = PROFILE_COLORS[payload.Profile] ?? '#6b7280'
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.8} stroke="white" strokeWidth={2} />
    </g>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: ProfileDecomposition }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow text-xs">
      <div className="font-semibold mb-1">{d.Profile}</div>
      <div>Tech Loss: {(d.Tech_loss_PI * 100).toFixed(1)}%</div>
      <div>Human Loss: {(d.Human_loss_PI_DeltaStar * 100).toFixed(1)}%</div>
      <div>Strategy: {d.Strategy}</div>
    </div>
  )
}

export function StrategyMatrixSection({ profiles }: Props) {
  const decomp = computeProfileDecomposition(profiles)

  const techVals = decomp.map((d) => d.Tech_loss_PI)
  const humanVals = decomp.map((d) => d.Human_loss_PI_DeltaStar)
  const medianTech = median(techVals)
  const medianHuman = median(humanVals)

  const scatterData = decomp.map((d) => ({
    ...d,
    x: d.Tech_loss_PI * 100,
    y: d.Human_loss_PI_DeltaStar * 100,
  }))

  return (
    <section className="mb-12">
      <SectionHeader
        id="strategy-matrix"
        title="Technology vs Human-Factor Strategy Matrix"
        badge="6"
        subtitle="Each point is a risk profile. Quadrant position determines the recommended managerial intervention. Median reference lines define quadrants."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-4">
        <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4 text-xs">
          {[
            { q: 'Q1 (High tech, High human)', text: 'Combined measurement + updating support', color: 'bg-red-50 border-red-200' },
            { q: 'Q2 (High tech, Low human)', text: 'Measurement technology first', color: 'bg-orange-50 border-orange-200' },
            { q: 'Q3 (Low tech, High human)', text: 'Decision support first', color: 'bg-blue-50 border-blue-200' },
            { q: 'Q4 (Low tech, Low human)', text: 'Lower priority for costly intervention', color: 'bg-green-50 border-green-200' },
          ].map((item) => (
            <div key={item.q} className={`rounded border p-2 ${item.color}`}>
              <div className="font-semibold text-gray-700">{item.q}</div>
              <div className="text-gray-500 mt-0.5">{item.text}</div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="x"
              type="number"
              name="Tech Loss"
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fontSize: 11 }}
              label={{ value: 'Tech Loss / PI (%)', position: 'insideBottom', offset: -10, fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Human Loss"
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fontSize: 11 }}
              label={{ value: 'Human Loss / PI (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={medianTech * 100}
              stroke="#94a3b8"
              strokeDasharray="4 2"
              label={{ value: 'Median tech', position: 'top', fontSize: 10, fill: '#94a3b8' }}
            />
            <ReferenceLine
              y={medianHuman * 100}
              stroke="#94a3b8"
              strokeDasharray="4 2"
              label={{ value: 'Median human', position: 'right', fontSize: 10, fill: '#94a3b8' }}
            />
            <Scatter
              data={scatterData}
              shape={<CustomDot />}
            >
              <LabelList dataKey="Profile" position="top" style={{ fontSize: 9, fill: '#374151' }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {decomp.map((d) => (
            <span key={d.Profile} className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: PROFILE_COLORS[d.Profile] ?? '#6b7280' }}
              />
              {d.Profile}
            </span>
          ))}
        </div>
      </div>

      <InterpretationBox
        lines={[
          'This matrix helps managers decide whether the model-implied value gap is driven more by noisy measurement, biased learning, or both.',
          'Tech_loss_PI = NVI_KF / (1 + NVI_KF) captures losses from measurement noise even under optimal learning.',
          'Human_loss_PI = Total_loss_PI(Δ*) − Tech_loss_PI captures the additional loss from biased updating relative to optimal KF.',
        ]}
        variant="insight"
      />

      <div className="mt-4">
        <DataTable columns={columns} data={decomp} />
      </div>
    </section>
  )
}
