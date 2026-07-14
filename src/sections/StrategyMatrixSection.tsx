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

// Quadrant → color mapping. Point color is derived from the quadrant a profile
// falls in (relative to the median reference lines), so it always matches the
// quadrant legend and automatically follows a point if the data moves it.
type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4'

const QUADRANT_COLORS: Record<Quadrant, string> = {
  Q1: '#dc2626', // high tech, high human — red
  Q2: '#ea580c', // high tech, low human  — orange
  Q3: '#2563eb', // low tech, high human  — blue
  Q4: '#16a34a', // low tech, low human   — green
}

const QUADRANTS: { q: Quadrant; title: string; text: string; card: string }[] = [
  { q: 'Q1', title: 'Q1 (High tech, High human)', text: 'Combined measurement + updating support', card: 'bg-red-50 border-red-200' },
  { q: 'Q2', title: 'Q2 (High tech, Low human)', text: 'Measurement technology first', card: 'bg-orange-50 border-orange-200' },
  { q: 'Q3', title: 'Q3 (Low tech, High human)', text: 'Decision support first', card: 'bg-blue-50 border-blue-200' },
  { q: 'Q4', title: 'Q4 (Low tech, Low human)', text: 'Lower priority for costly intervention', card: 'bg-green-50 border-green-200' },
]

function getQuadrant(tech: number, human: number, medTech: number, medHuman: number): Quadrant {
  const highTech = tech > medTech
  const highHuman = human > medHuman
  if (highTech && highHuman) return 'Q1'
  if (highTech && !highHuman) return 'Q2'
  if (!highTech && highHuman) return 'Q3'
  return 'Q4'
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

type ScatterPoint = ProfileDecomposition & { x: number; y: number; _quadrant: Quadrant; _color: string }

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: ScatterPoint
}

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  if (!payload) return null
  const color = payload._color ?? '#6b7280'
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.85} stroke="white" strokeWidth={2} />
    </g>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: ScatterPoint }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow text-xs">
      <div className="flex items-center gap-1.5 font-semibold mb-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d._color }} />
        {d.Profile}
      </div>
      <div>Tech Loss: {(d.Tech_loss_PI * 100).toFixed(1)}%</div>
      <div>Human Loss: {(d.Human_loss_PI_DeltaStar * 100).toFixed(1)}%</div>
      <div>Quadrant: {d._quadrant}</div>
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

  const scatterData: ScatterPoint[] = decomp.map((d) => {
    const quadrant = getQuadrant(d.Tech_loss_PI, d.Human_loss_PI_DeltaStar, medianTech, medianHuman)
    return {
      ...d,
      x: d.Tech_loss_PI * 100,
      y: d.Human_loss_PI_DeltaStar * 100,
      _quadrant: quadrant,
      _color: QUADRANT_COLORS[quadrant],
    }
  })

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
          {QUADRANTS.map((item) => (
            <div key={item.q} className={`rounded border p-2 ${item.card}`}>
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[item.q] }} />
                {item.title}
              </div>
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
              label={{ value: 'Median human', position: 'insideBottomRight', fontSize: 10, fill: '#94a3b8' }}
            />
            <Scatter
              data={scatterData}
              shape={<CustomDot />}
            >
              <LabelList dataKey="Profile" position="top" style={{ fontSize: 9, fill: '#374151' }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {QUADRANTS.map((item) => {
            const members = scatterData.filter((d) => d._quadrant === item.q).map((d) => d.Profile)
            return (
              <span key={item.q} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: QUADRANT_COLORS[item.q] }}
                />
                <span className="font-semibold text-gray-700">{item.q}</span>
                <span className="text-gray-500">
                  {members.length ? `— ${members.join(', ')}` : '— (none)'}
                </span>
              </span>
            )
          })}
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
