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
import { AlertTriangle, Activity } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'executive-summary', label: '1. Executive Summary' },
  { id: 'scenario-explorer', label: '2. Scenario Explorer' },
  { id: 'factor-summary', label: '3. Factor Summary' },
  { id: 'heatmap', label: '4. HF × TF Heatmap' },
  { id: 'risk-profiles', label: '5. Risk Profiles' },
  { id: 'strategy-matrix', label: '6. Strategy Matrix' },
  { id: 'delay-vulnerability', label: '7. Delay Vulnerability' },
  { id: 'takeaways', label: '8. Takeaways' },
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-md">
        <div className="mx-auto max-w-screen-xl px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">
              HTN Information Value Explorer
            </h1>
            <p className="text-xs text-navy-200 leading-tight hidden sm:block">
              Research prototype for exploring where improved BP information and calibrated learning create the greatest expected QALY value.
            </p>
          </div>
          <div className="shrink-0 text-xs text-navy-300 max-w-xs text-right hidden md:block">
            <span className="italic">
              Not a clinical decision tool. Research use only.
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-navy-700 overflow-x-auto">
          <div className="mx-auto max-w-screen-xl px-4 flex gap-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="shrink-0 px-3 py-2 text-xs text-navy-200 hover:text-white hover:bg-navy-700 whitespace-nowrap transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-400">
        <p>
          HTN Information Value Explorer — Research Prototype. Model-generated scenario analysis. Not for clinical use.
        </p>
        <p className="mt-1">
          NVI = (v<sup>PI</sup> − v<sup>j</sup>) / v<sup>j</sup> &nbsp;|&nbsp;
          PI-Scaled Loss = NVI / (1 + NVI) = (v<sup>PI</sup> − v<sup>j</sup>) / v<sup>PI</sup>
        </p>
      </footer>
    </div>
  )
}
