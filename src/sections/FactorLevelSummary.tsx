import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SectionHeader } from '../components/SectionHeader'
import { InterpretationBox } from '../components/InterpretationBox'
import { DataTable } from '../components/DataTable'
import { TooltipLabel } from '../components/TooltipLabel'
import type { FactorLevelSummary } from '../types'
import { toCSV } from '../utils/calculations'
import { Download } from 'lucide-react'

interface Props {
  summaries: FactorLevelSummary[]
}

const FACTOR_LABELS: Record<string, string> = {
  HF: 'HF (Human Factor)',
  TF: 'TF (Tech Factor)',
  LBPV: 'LBPV',
  SBPV: 'SBPV',
  Sex: 'Sex',
}

const COLORS: Record<string, string> = {
  HF: '#1e3a5f',
  TF: '#c0392b',
  LBPV: '#2563eb',
  SBPV: '#7c3aed',
  Sex: '#64748b',
}

function FactorBarChart({ factor, data }: { factor: string; data: FactorLevelSummary[] }) {
  const chartData = data.map((d) => ({
    level: d.level,
    'Mean NVI (%)': parseFloat((d.mean_NVI * 100).toFixed(2)),
  }))
  const color = COLORS[factor] ?? '#6b7280'

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-2">{FACTOR_LABELS[factor]}</h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="level" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Mean NVI']} />
          <Bar dataKey="Mean NVI (%)" radius={[3, 3, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.7 + i * 0.1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const columns = [
  { key: 'factor', header: 'Factor', sortable: true },
  { key: 'level', header: 'Level', sortable: true },
  { key: 'n', header: 'n', sortable: true, align: 'right' as const },
  {
    key: 'mean_NVI',
    header: <TooltipLabel term="NVI">Mean NVI</TooltipLabel>,
    render: (r: FactorLevelSummary) => `${(r.mean_NVI * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'median_NVI',
    header: 'Median NVI',
    render: (r: FactorLevelSummary) => `${(r.median_NVI * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'sd_NVI',
    header: 'SD NVI',
    render: (r: FactorLevelSummary) => `${(r.sd_NVI * 100).toFixed(1)}%`,
    align: 'right' as const,
  },
  {
    key: 'mean_PI_scaled_loss',
    header: <TooltipLabel term="PI_scaled_loss">Mean PI-Scaled Loss</TooltipLabel>,
    render: (r: FactorLevelSummary) => `${(r.mean_PI_scaled_loss * 100).toFixed(1)}%`,
    sortable: true,
    align: 'right' as const,
  },
]

export function FactorLevelSummarySection({ summaries }: Props) {
  const factors = ['HF', 'TF', 'LBPV', 'SBPV', 'Sex']

  function handleExport() {
    toCSV(
      summaries.map((s) => ({
        Factor: s.factor,
        Level: s.level,
        n: s.n,
        Mean_NVI_pct: (s.mean_NVI * 100).toFixed(2),
        Median_NVI_pct: (s.median_NVI * 100).toFixed(2),
        SD_NVI_pct: (s.sd_NVI * 100).toFixed(2),
        Mean_PI_scaled_loss_pct: (s.mean_PI_scaled_loss * 100).toFixed(2),
      })),
      'factor_level_summary.csv'
    )
  }

  return (
    <section className="mb-12">
      <SectionHeader
        id="factor-summary"
        title="Factor-Level Managerial Summary"
        badge="3"
        subtitle="Mean NVI by factor and level. Higher bars indicate scenarios where improved information creates greater expected QALY value."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {factors.map((f) => (
            <FactorBarChart
              key={f}
              factor={f}
              data={summaries.filter((s) => s.factor === f)}
            />
          ))}
        </div>
      </div>

      <InterpretationBox
        lines={[
          'Human/updating distortion and technology/measurement noise are the largest drivers of normalized VOI. BP variability also increases the value of improved information. This supports targeted information interventions rather than one-size-fits-all investments.',
        ]}
        variant="insight"
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
        >
          <Download size={14} />
          Download factor summary CSV
        </button>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={summaries} />
      </div>
    </section>
  )
}
