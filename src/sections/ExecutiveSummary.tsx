import React from 'react'
import { SummaryCard } from '../components/SummaryCard'
import { SectionHeader } from '../components/SectionHeader'
import { TooltipLabel } from '../components/TooltipLabel'
import type { GLMRow, FactorLevelSummary } from '../types'
import { mean, computeLargestDriver } from '../utils/calculations'

interface Props {
  rows: GLMRow[]
  summaries: FactorLevelSummary[]
}

const FACTOR_LABELS: Record<string, string> = {
  HF: 'Human/Updating Factor (HF)',
  TF: 'Technology/Measurement Factor (TF)',
  LBPV: 'Long-Term BP Variability (LBPV)',
  SBPV: 'Short-Term BP Variability (SBPV)',
  Sex: 'Sex',
}

export function ExecutiveSummary({ rows, summaries }: Props) {
  if (rows.length === 0) return null

  const topRow = rows.reduce((a, b) => (a.NVI > b.NVI ? a : b))
  const avgNVI = mean(rows.map((r) => r.NVI))
  const largestDriver = computeLargestDriver(summaries)

  return (
    <section className="mb-12">
      <SectionHeader
        id="executive-summary"
        title="Executive Summary"
        badge="1"
        subtitle="Model-generated scenario highlights. These cards summarize key patterns from the NVI analysis."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Highest-Priority Scenario" accent="red">
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Sex:</span> {topRow.Sex}</div>
            <div><span className="text-gray-500"><TooltipLabel term="HF">HF</TooltipLabel>:</span> {topRow.HF}</div>
            <div><span className="text-gray-500"><TooltipLabel term="TF">TF</TooltipLabel>:</span> {topRow.TF}</div>
            <div><span className="text-gray-500"><TooltipLabel term="LBPV">LBPV</TooltipLabel>:</span> {topRow.LBPV}</div>
            <div><span className="text-gray-500"><TooltipLabel term="SBPV">SBPV</TooltipLabel>:</span> {topRow.SBPV}</div>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500"><TooltipLabel term="NVI">NVI</TooltipLabel>:</span>{' '}
              <span className="text-2xl font-bold text-red-600">{topRow.NVI_pct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-500"><TooltipLabel term="PI_scaled_loss">PI-scaled loss</TooltipLabel>:</span>{' '}
              <span className="font-semibold">{topRow.PI_scaled_loss_pct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {topRow.priority}
              </span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Average NVI (all scenarios)" accent="navy">
          <div className="text-4xl font-bold text-navy-900 mt-1">
            {(avgNVI * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mean <TooltipLabel term="NVI">normalized value of information</TooltipLabel> across all {rows.length} model-generated scenarios.
          </p>
        </SummaryCard>

        <SummaryCard title="Largest Driver of NVI" accent="blue">
          <div className="text-xl font-bold text-navy-800 mt-1">
            {FACTOR_LABELS[largestDriver] ?? largestDriver}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Factor with the widest range in mean NVI across its levels. High updating distortion
            (HF=H) is typically the dominant factor.
          </p>
        </SummaryCard>

        <SummaryCard title="Main Managerial Insight" accent="gray">
          <p className="text-sm leading-relaxed">
            Information-improvement interventions are most valuable when measurement noise, BP
            variability, and human updating frictions coincide.
          </p>
        </SummaryCard>
      </div>
    </section>
  )
}
