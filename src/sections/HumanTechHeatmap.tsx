import React from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { InterpretationBox } from '../components/InterpretationBox'
import { TooltipLabel } from '../components/TooltipLabel'
import type { GLMRow } from '../types'
import { computeHeatmapData, mean } from '../utils/calculations'

interface Props {
  rows: GLMRow[]
}

const HF_LEVELS = ['O', 'L', 'H'] as const
const TF_LEVELS = ['L', 'M', 'H'] as const

function getColor(val: number, min: number, max: number): string {
  const t = max > min ? (val - min) / (max - min) : 0
  // Interpolate from white (#ffffff) to navy (#1e3a5f)
  const r = Math.round(255 - t * (255 - 30))
  const g = Math.round(255 - t * (255 - 58))
  const b = Math.round(255 - t * (255 - 95))
  return `rgb(${r},${g},${b})`
}

function getTextColor(val: number, min: number, max: number): string {
  const t = max > min ? (val - min) / (max - min) : 0
  return t > 0.5 ? 'white' : '#1e3a5f'
}

function Heatmap({ data, sex }: { data: ReturnType<typeof computeHeatmapData>; sex: string }) {
  const filtered = data.filter((d) => d.Sex === sex)
  const vals = filtered.map((d) => d.mean_NVI)
  const min = Math.min(...vals)
  const max = Math.max(...vals)

  return (
    <div>
      <h4 className="text-sm font-semibold text-center text-gray-600 mb-3">
        Sex = {sex === 'F' ? 'Female' : 'Male'}
      </h4>
      <div className="overflow-x-auto">
        <table className="mx-auto text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs text-gray-400 font-normal">
                <TooltipLabel term="HF">HF</TooltipLabel> ↓ / <TooltipLabel term="TF">TF</TooltipLabel> →
              </th>
              {TF_LEVELS.map((tf) => (
                <th key={tf} className="w-28 p-2 text-center text-xs font-semibold text-gray-600">
                  TF={tf}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HF_LEVELS.map((hf) => (
              <tr key={hf}>
                <td className="p-2 text-xs font-semibold text-gray-600 pr-4">HF={hf}</td>
                {TF_LEVELS.map((tf) => {
                  const cell = filtered.find((d) => d.HF === hf && d.TF === tf)
                  const v = cell?.mean_NVI ?? 0
                  const bg = getColor(v, min, max)
                  const fg = getTextColor(v, min, max)
                  return (
                    <td
                      key={tf}
                      className="w-28 h-16 text-center font-semibold rounded-sm"
                      style={{ backgroundColor: bg, color: fg }}
                      title={`HF=${hf}, TF=${tf}, Sex=${sex}: Mean NVI = ${(v * 100).toFixed(1)}%`}
                    >
                      {(v * 100).toFixed(1)}%
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function HumanTechHeatmapSection({ rows }: Props) {
  const heatmapData = computeHeatmapData(rows)

  return (
    <section className="mb-12">
      <SectionHeader
        id="heatmap"
        title="Human × Technology Heatmap"
        badge="4"
        subtitle="Mean NVI by HF and TF levels, faceted by sex. Darker cells = higher NVI = more potential value from information improvement."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-4">
        <div className="grid gap-10 md:grid-cols-2">
          <Heatmap data={heatmapData} sex="F" />
          <Heatmap data={heatmapData} sex="M" />
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
          <span>Low NVI</span>
          <div
            className="h-4 w-40 rounded"
            style={{
              background: 'linear-gradient(to right, #ffffff, #1e3a5f)',
              border: '1px solid #e5e7eb',
            }}
          />
          <span>High NVI</span>
        </div>
      </div>

      <InterpretationBox
        lines={[
          'The heatmap highlights complementarity between measurement quality and physician updating. The highest NVI occurs when high measurement noise and high human-factor distortion occur together. This suggests that better measurement technology and decision-support interventions may be complements rather than substitutes.',
        ]}
        variant="insight"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'HF=H & TF=H', text: 'Prioritize combined intervention: measurement + decision support.' },
          { label: 'HF=H only', text: 'Prioritize decision support or feedback to reduce biased updating.' },
          { label: 'TF=H only', text: 'Prioritize measurement quality improvement.' },
          { label: 'HF=O & TF=L', text: 'Lower priority for costly information interventions.' },
        ].map((rec) => (
          <div key={rec.label} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
            <span className="font-semibold text-navy-800">{rec.label}: </span>
            <span className="text-gray-600">{rec.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
