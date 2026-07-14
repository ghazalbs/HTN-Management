import React, { useMemo } from 'react'
import { useData } from './hooks/useData'
import { computeFactorSummaries } from './utils/calculations'
import { ExecutiveSummary } from './sections/ExecutiveSummary'
import { ScenarioExplorer } from './sections/ScenarioExplorer'
import { FactorLevelSummarySection } from './sections/FactorLevelSummary'
import { HumanTechHeatmapSection } from './sections/HumanTechHeatmap'
import { RiskProfileComparison } from './sections/RiskProfileComparison'
import { StrategyMatrixSection } from './sections/StrategyMatrixSection'
import { DelayVulnerabilitySection } from './sections/DelayVulnerability'
import { ManagerialTakeaways } from './sections/ManagerialTakeaways'
import { BreakEvenAnalysis } from './sections/BreakEvenAnalysis'
import { AlertTriangle, Activity, ArrowRight, LineChart } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'executive-summary', label: '1. Executive Summary' },
  { id: 'scenario-explorer', label: '2. Scenario Explorer' },
  { id: 'factor-summary', label: '3. Factor Summary' },
  { id: 'heatmap', label: '4. HF × TF Heatmap' },
  { id: 'risk-profiles', label: '5. Risk Profiles' },
  { id: 'strategy-matrix', label: '6. Strategy Matrix' },
  { id: 'delay-vulnerability', label: '7. Delay Vulnerability' },
  { id: 'takeaways', label: '8. Takeaways' },
  { id: 'break-even', label: '9. Break-Even' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function App() {
  const { glmRows, riskProfiles, loading, usingMock, mockReason } = useData()
  const factorSummaries = useMemo(() => computeFactorSummaries(glmRows), [glmRows])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="mx-auto mb-3 animate-pulse text-navy-800" size={32} />
          <p className="text-gray-500 text-sm">Loading data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sticky brand + navigation bar */}
      <header className="sticky top-0 z-40 border-b border-navy-700 bg-navy-900 text-white shadow-md">
        <div className="mx-auto max-w-screen-xl px-4 py-2.5 flex items-center justify-between gap-4">
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/30">
              <Activity size={16} />
            </span>
            <span className="text-sm font-semibold tracking-tight leading-none">
              HTN Information Value Explorer
            </span>
          </button>
          <span className="shrink-0 text-[11px] italic text-navy-300 hidden md:block">
            Research prototype · not a clinical tool
          </span>
        </div>

        {/* Navigation */}
        <nav className="border-t border-navy-700/70 overflow-x-auto">
          <div className="mx-auto max-w-screen-xl px-4 flex gap-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs text-navy-200 hover:border-teal-400 hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white scroll-mt-24"
      >
        {/* subtle grid / glow accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div className="relative mx-auto grid max-w-screen-xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-300 ring-1 ring-inset ring-teal-400/30">
              <LineChart size={13} /> Health-technology research prototype
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              HTN Information{' '}
              <span className="text-teal-300">Value Explorer</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-100 sm:text-base">
              A decision-support analysis of where improved blood-pressure information and
              calibrated learning create the greatest expected QALY value in hypertension
              management — pairing model-generated risk-profile scenarios with an economic
              break-even assessment of measurement technology.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo('executive-summary')}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                Explore the Analysis <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollTo('break-even')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                Break-Even Analysis
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-white/10">
              <img
                src="/images/hero-htn.png"
                alt="Illustration of an automated office blood-pressure monitor feeding a clinical decision-support dashboard with a trend chart and patient risk-profile cards"
                className="h-auto w-full"
                loading="eager"
                width={1376}
                height={768}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mock data banner */}
      {usingMock && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>Mock Data:</strong> {mockReason}
          </span>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-800">
        <strong>Disclaimer:</strong> This research prototype summarizes model-generated scenarios. It is not a clinical decision tool and should not be used to diagnose, treat, or manage individual patients.
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-screen-xl px-4 py-8">
        <ExecutiveSummary rows={glmRows} summaries={factorSummaries} />
        <ScenarioExplorer rows={glmRows} />
        <FactorLevelSummarySection summaries={factorSummaries} />
        <HumanTechHeatmapSection rows={glmRows} />
        <RiskProfileComparison profiles={riskProfiles} />
        <StrategyMatrixSection profiles={riskProfiles} />
        <DelayVulnerabilitySection rows={glmRows} />
        <ManagerialTakeaways />
        <BreakEvenAnalysis />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-400">
        <p>
          HTN Information Value Explorer — Research Prototype. Model-generated scenario analysis. Not for clinical use.
        </p>
      </footer>
    </div>
  )
}
