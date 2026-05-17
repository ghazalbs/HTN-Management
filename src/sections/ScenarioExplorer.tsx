import React, { useState, useMemo } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { InterpretationBox } from '../components/InterpretationBox'
import { TooltipLabel } from '../components/TooltipLabel'
import { toCSV } from '../utils/calculations'
import type { GLMRow, HFLevel, TFLevel, LBPVLevel, SBPVLevel, SexLevel } from '../types'
import { Download } from 'lucide-react'

interface Props {
  rows: GLMRow[]
}

type SelectProps = {
  label: React.ReactNode
  value: string
  onChange: (v: string) => void
  options: string[]
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

const PRIORITY_COLORS: Record<string, string> = {
  'Top 10%': 'bg-red-100 text-red-800 border-red-300',
  'High priority': 'bg-orange-100 text-orange-800 border-orange-300',
  'Moderate priority': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Lower priority': 'bg-green-100 text-green-700 border-green-300',
}

function buildInterpretation(row: GLMRow): string[] {
  const lines: string[] = []

  if (row.HF === 'H' && row.TF === 'H') {
    lines.push(
      'Both human updating distortion and measurement noise are high. The model suggests a combined intervention: better BP measurement plus decision support for calibrated updating.'
    )
  } else if (row.HF === 'H') {
    lines.push(
      'Human updating distortion is a key concern. Decision support, feedback, or structured escalation protocols may be valuable.'
    )
  } else if (row.TF === 'H') {
    lines.push(
      'Measurement noise is a key concern. Better BP measurement procedures or technology may be valuable.'
    )
  } else if (row.HF === 'O' && row.TF === 'L') {
    lines.push(
      'This scenario is close to the lower-loss benchmark. Costly information interventions may be lower priority.'
    )
  }

  if (row.LBPV === 'H') {
    lines.push(
      'High long-term BP variability suggests that outdated beliefs may become costly; closer monitoring may be useful.'
    )
  }
  if (row.SBPV === 'H') {
    lines.push(
      'High short-term BP variability makes it harder to distinguish noise from true BP changes; repeated or more reliable measurement may be useful.'
    )
  }

  if (lines.length === 0) {
    lines.push('Moderate distortion levels. Review factor-level summaries for broader context.')
  }

  return lines
}

export function ScenarioExplorer({ rows }: Props) {
  const [sex, setSex] = useState<SexLevel>('F')
  const [hf, setHF] = useState<HFLevel>('O')
  const [tf, setTF] = useState<TFLevel>('L')
  const [lbpv, setLBPV] = useState<LBPVLevel>('L')
  const [sbpv, setSBPV] = useState<SBPVLevel>('L')

  const match = useMemo(
    () =>
      rows.find(
        (r) => r.Sex === sex && r.HF === hf && r.TF === tf && r.LBPV === lbpv && r.SBPV === sbpv
      ),
    [rows, sex, hf, tf, lbpv, sbpv]
  )

  const interpretation = match ? buildInterpretation(match) : []

  function handleExport() {
    if (!match) return
    toCSV(
      [
        {
          Sex: match.Sex,
          HF: match.HF,
          TF: match.TF,
          LBPV: match.LBPV,
          SBPV: match.SBPV,
          NVI_pct: match.NVI_pct.toFixed(1),
          PI_scaled_loss_pct: match.PI_scaled_loss_pct.toFixed(1),
          Priority: match.priority,
        },
      ],
      'scenario_summary.csv'
    )
  }

  return (
    <section className="mb-12">
      <SectionHeader
        id="scenario-explorer"
        title="Scenario Explorer"
        badge="2"
        subtitle="Select a scenario to see the model-implied NVI and managerial interpretation. All outputs are scenario-based model results, not clinical recommendations."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-6">
          <Select
            label="Sex"
            value={sex}
            onChange={(v) => setSex(v as SexLevel)}
            options={['F', 'M']}
          />
          <Select
            label={<TooltipLabel term="HF">HF (Human Factor)</TooltipLabel>}
            value={hf}
            onChange={(v) => setHF(v as HFLevel)}
            options={['O', 'L', 'H']}
          />
          <Select
            label={<TooltipLabel term="TF">TF (Tech Factor)</TooltipLabel>}
            value={tf}
            onChange={(v) => setTF(v as TFLevel)}
            options={['L', 'M', 'H']}
          />
          <Select
            label={<TooltipLabel term="LBPV">LBPV</TooltipLabel>}
            value={lbpv}
            onChange={(v) => setLBPV(v as LBPVLevel)}
            options={['L', 'M', 'H']}
          />
          <Select
            label={<TooltipLabel term="SBPV">SBPV</TooltipLabel>}
            value={sbpv}
            onChange={(v) => setSBPV(v as SBPVLevel)}
            options={['L', 'M', 'H']}
          />
        </div>

        {match ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-navy-50 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  <TooltipLabel term="NVI">NVI</TooltipLabel>
                </div>
                <div className="text-3xl font-bold text-navy-900">
                  {match.NVI_pct.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  <TooltipLabel term="PI_scaled_loss">PI-Scaled Loss</TooltipLabel>
                </div>
                <div className="text-3xl font-bold text-blue-800">
                  {match.PI_scaled_loss_pct.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Priority Tier</div>
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    PRIORITY_COLORS[match.priority]
                  }`}
                >
                  {match.priority}
                </span>
              </div>
            </div>

            <InterpretationBox lines={interpretation} variant="info" />

            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
              >
                <Download size={14} />
                Download scenario CSV
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No matching scenario found for this combination.
          </p>
        )}
      </div>
    </section>
  )
}
