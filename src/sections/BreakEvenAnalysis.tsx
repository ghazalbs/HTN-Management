import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CheckCircle2, Download, ChevronDown } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { SummaryCard } from '../components/SummaryCard'
import { InterpretationBox } from '../components/InterpretationBox'
import {
  ASSUMPTIONS,
  computeAllScenarios,
  computeHFImplied,
  conservativeImpliedAnnualized,
  incrementalCostLow,
  incrementalCostHigh,
  voiPI,
  fmtCurrency,
  fmtMultiple,
  fmtSci,
} from '../utils/breakeven'

const WORKBOOK_PATH = '/downloads/breakeven_calc.xlsx'

// Render a small QALY value as m × 10^e with a proper superscript exponent.
function Sci({ value, sig = 2 }: { value: number; sig?: number }) {
  const { mantissa, exponent } = fmtSci(value, sig)
  return (
    <span className="whitespace-nowrap">
      {mantissa} × 10<sup>{exponent}</sup>
    </span>
  )
}

export function BreakEvenAnalysis() {
  const scenarios = computeAllScenarios()
  const hfImplied = computeHFImplied()
  const implied = conservativeImpliedAnnualized()

  // Card ranges derived from scenario results.
  const costMin = Math.min(...scenarios.map((s) => s.annCostLow))
  const costMax = Math.max(...scenarios.map((s) => s.annCostHigh))
  const reqMin = Math.min(...scenarios.map((s) => s.requiredQalyMid))
  const reqMax = Math.max(...scenarios.map((s) => s.requiredQalyMid))
  const allBreakEven = scenarios.every((s) => s.breaksEven)

  const chartData = scenarios.map((s) => ({
    label: s.label.replace(' · ', '\n'),
    shortLabel: s.label,
    multiple: Math.round(s.breakEvenMultiple),
  }))

  return (
    <section className="mb-4">
      <SectionHeader
        id="break-even"
        title="Break-Even Analysis"
        badge="9"
        subtitle="Comparing the incremental cost of automated office blood-pressure (AOBP) technology against traditional measurement, and the annual QALY gain per patient required for the technology to break even at the CADTH C$50,000/QALY threshold."
      />

      {/* Intro */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-sm">
        This analysis translates the model results into an economic decision. The extra
        up-front cost of AOBP equipment (relative to a conventional sphygmomanometer) is
        amortized over the device lifetime and patient volume to an{' '}
        <strong>annual incremental cost per patient</strong>. Dividing by the willingness-to-pay
        threshold gives the <strong>annual QALY gain the technology must produce to break even</strong>.
        That required gain is then compared with a conservative, model-implied QALY gain to judge
        whether the investment is justified across realistic deployment scenarios.
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Break-Even Verdict" accent="navy">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold leading-snug text-navy-900">
              {allBreakEven ? 'Break-even achieved across all evaluated scenarios' : 'Break-even not reached in some scenarios'}
            </p>
          </div>
        </SummaryCard>

        <SummaryCard title="Annual Incremental Cost / Patient" accent="blue">
          <p className="text-2xl font-bold tracking-tight text-navy-900">
            {fmtCurrency(costMin)} – {fmtCurrency(costMax)}
          </p>
          <p className="mt-1 text-xs text-gray-500">per patient per year, across scenarios</p>
        </SummaryCard>

        <SummaryCard title="Required Annual QALY Gain" accent="gray">
          <p className="text-xl font-bold tracking-tight text-navy-900">
            <Sci value={reqMin} /> – <Sci value={reqMax} />
          </p>
          <p className="mt-1 text-xs text-gray-500">QALYs / patient / year to break even (midpoint)</p>
        </SummaryCard>

        <SummaryCard title="Conservative Model-Implied Gain" accent="red">
          <p className="text-2xl font-bold tracking-tight text-navy-900">{implied.toFixed(5)}</p>
          <p className="mt-1 text-xs text-gray-500">QALYs / patient / year (HF = Optimal, conservative)</p>
        </SummaryCard>
      </div>

      {/* Scenario table */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-navy-900">Deployment scenario comparison</h3>
        <p className="mb-3 text-xs text-gray-500">
          Midpoint annual cost and the conservative HF = Optimal implied gain ({implied.toFixed(5)} QALYs/patient/year).
          Values are per patient per year.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-navy-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 font-semibold">Deployment scenario</th>
                <th className="py-2 pr-4 text-right font-semibold">Annual cost / pt</th>
                <th className="py-2 pr-4 text-right font-semibold">Required QALY / yr</th>
                <th className="py-2 pr-4 text-right font-semibold">Implied QALY / yr</th>
                <th className="py-2 pr-4 text-right font-semibold">Break-even multiple</th>
                <th className="py-2 pl-2 text-right font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.key} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">{s.label}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{fmtCurrency(s.annCostMid)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">
                    <Sci value={s.requiredQalyMid} />
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{s.impliedConservative.toFixed(5)}</td>
                  <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-navy-900">
                    {fmtMultiple(s.breakEvenMultiple)}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <CheckCircle2 size={12} /> {s.breaksEven ? 'Breaks even' : 'Below threshold'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          Break-even multiple = conservative implied gain ÷ required gain. A value ≥ 1× confirms break-even;
          the reported multiples indicate the implied gain exceeds the required threshold by two-to-three orders of magnitude.
        </p>
      </div>

      {/* Break-even multiple chart */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-navy-900">Break-even margin by scenario</h3>
        <p className="mb-3 text-xs text-gray-500">
          How many times the conservative model-implied QALY gain exceeds the gain required to break even.
          The dashed line marks the 1× break-even threshold.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}×`}
              domain={[0, 'dataMax']}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              tick={{ fontSize: 11 }}
              width={150}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(v: number) => [`${v.toLocaleString()}×`, 'Break-even multiple']}
            />
            <ReferenceLine
              x={1}
              stroke="#dc2626"
              strokeDasharray="4 2"
              label={{ value: '1× break-even', position: 'insideTopLeft', fontSize: 10, fill: '#dc2626' }}
            />
            <Bar dataKey="multiple" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="#0d9488" />
              ))}
              <LabelList
                dataKey="multiple"
                position="right"
                formatter={(v: number) => `${v.toLocaleString()}×`}
                style={{ fontSize: 11, fill: '#334e68', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <InterpretationBox
        lines={[
          'Because the device cost is small and spread over many patient-years, the annual incremental cost per patient is well under C$3.',
          'The QALY gain required to justify this cost is therefore extremely small (on the order of 10⁻⁵ QALYs per patient per year).',
          'Even the most conservative model-implied gain (HF = Optimal) exceeds this requirement by hundreds of times in every scenario evaluated.',
        ]}
        variant="insight"
      />

      {/* Assumptions & methodology accordion */}
      <details className="group mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-navy-900">
          <span>Assumptions and Methodology</span>
          <ChevronDown size={18} className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="mb-4 text-xs leading-relaxed text-gray-500">
            Values are based on CADTH cost information and the MDP factorial analysis, as indicated in the
            source workbook. VOI(PI) = V(PI) − V(0). Model-implied gains use Relative_value_to_PI parameters
            from the factorial analysis; the annualized gain divides the absolute QALY gain by the treatment horizon.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="min-w-0">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Cost &amp; deployment</h4>
              <dl className="divide-y divide-gray-100 text-sm">
                {[
                  ['AOBP device cost (low – high)', `${fmtCurrency(ASSUMPTIONS.aobpDeviceCostLow, 0)} – ${fmtCurrency(ASSUMPTIONS.aobpDeviceCostHigh, 0)}`],
                  ['Conventional device cost', fmtCurrency(ASSUMPTIONS.conventionalDeviceCost, 0)],
                  ['Incremental cost (low – high)', `${fmtCurrency(incrementalCostLow(), 0)} – ${fmtCurrency(incrementalCostHigh(), 0)}`],
                  ['Willingness-to-pay threshold', `${fmtCurrency(ASSUMPTIONS.wtpThreshold, 0)} / QALY`],
                  ['Device lifetime', `${ASSUMPTIONS.deviceLifetime} years`],
                  ['Patients seen per year', `${ASSUMPTIONS.patientsPerYear}`],
                  ['Treatment horizon', `${ASSUMPTIONS.treatmentHorizon} years`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="text-gray-600">{k}</dt>
                    <dd className="text-right font-medium tabular-nums text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Value &amp; model parameters</h4>
              <dl className="divide-y divide-gray-100 text-sm">
                {[
                  ['V(PI) — perfect information', `${ASSUMPTIONS.vPI} QALYs`],
                  ['V(0) — baseline', `${ASSUMPTIONS.v0} QALYs`],
                  ['VOI(PI) = V(PI) − V(0)', `${voiPI().toFixed(1)} QALYs`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="text-gray-600">{k}</dt>
                    <dd className="text-right font-medium tabular-nums text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[380px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-1.5 pr-3 font-semibold">HF scenario</th>
                      <th className="py-1.5 pr-3 text-right font-semibold">Rel. gain</th>
                      <th className="py-1.5 text-right font-semibold">Annualized QALY / yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hfImplied.map((h) => (
                      <tr key={h.key} className="border-b border-gray-100 last:border-0">
                        <td className="py-1.5 pr-3 text-gray-700">{h.label}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums text-gray-700">{h.relativeGain.toFixed(4)}</td>
                        <td className="py-1.5 text-right tabular-nums text-gray-700">{h.annualizedGain.toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Secondary download */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <span>Full model with all scenarios and sensitivity analysis:</span>
        <a
          href={WORKBOOK_PATH}
          download
          className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm transition-colors hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
        >
          <Download size={14} /> Download Break-Even Workbook
        </a>
      </div>
    </section>
  )
}
