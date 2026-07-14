// Break-even analysis — faithful port of breakeven_calc.xlsx (Assumptions + Results).
// All results are DERIVED from the base assumptions below via the same formulas
// used in the workbook, so the on-page numbers stay consistent with the source
// spreadsheet. Source: CADTH cost information + MDP factorial analysis.
//
// Workbook cell references are noted next to each formula for traceability.

export interface Assumptions {
  aobpDeviceCostLow: number // Assumptions!B12
  aobpDeviceCostHigh: number // Assumptions!B13
  conventionalDeviceCost: number // Assumptions!B14
  wtpThreshold: number // Assumptions!B15  (C$/QALY)
  deviceLifetime: number // Assumptions!B22 (years)
  patientsPerYear: number // Assumptions!B23
  treatmentHorizon: number // Assumptions!B24 (years)
  vPI: number // Assumptions!B38 (QALYs)
  v0: number // Assumptions!B39 (QALYs)
}

export const ASSUMPTIONS: Assumptions = {
  aobpDeviceCostLow: 895,
  aobpDeviceCostHigh: 1375,
  conventionalDeviceCost: 160,
  wtpThreshold: 50000,
  deviceLifetime: 5,
  patientsPerYear: 250,
  treatmentHorizon: 20,
  vPI: 12.2,
  v0: 10.7,
}

// Human-factor model parameters (Assumptions!A29:D32). Relative_value_to_PI for
// TF=Low (AOBP) and TF=High (Traditional); gain is the pure TF effect.
export interface HFScenario {
  key: string
  label: string
  tfLow: number
  tfHigh: number
  note: string
}

export const HF_SCENARIOS: HFScenario[] = [
  { key: 'optimal', label: 'HF = Optimal (Δ*)', tfLow: 0.9398, tfHigh: 0.8848, note: 'Unbiased learning — most conservative implied gain' },
  { key: 'low', label: 'HF = Low commitment (Δ_L)', tfLow: 0.8959, tfHigh: 0.7546, note: 'Under-reaction / physician inertia' },
  { key: 'high', label: 'HF = High commitment (Δ_H)', tfLow: 0.8309, tfHigh: 0.7, note: 'Over-commitment to prior beliefs' },
  { key: 'overall', label: 'Overall average (all HF)', tfLow: 0.8889, tfHigh: 0.7798, note: 'Averaged across all scenarios' },
]

// ---- Derived assumption values (Assumptions!B16, B17, B40) ----
export function incrementalCostLow(a: Assumptions = ASSUMPTIONS) {
  return a.aobpDeviceCostLow - a.conventionalDeviceCost // =B12-B14
}
export function incrementalCostHigh(a: Assumptions = ASSUMPTIONS) {
  return a.aobpDeviceCostHigh - a.conventionalDeviceCost // =B13-B14
}
export function voiPI(a: Assumptions = ASSUMPTIONS) {
  return a.vPI - a.v0 // =IF(B39="",B38,B38-B39)
}

// ---- Model-implied annualized QALY gain per HF scenario (Results sec. 3) ----
// Relative gain = tfLow - tfHigh; Absolute = gain × VOI(PI); Annualized = /horizon.
export interface HFImplied extends HFScenario {
  relativeGain: number
  absoluteGain: number
  annualizedGain: number
}

export function computeHFImplied(a: Assumptions = ASSUMPTIONS): HFImplied[] {
  const voi = voiPI(a)
  return HF_SCENARIOS.map((s) => {
    const relativeGain = s.tfLow - s.tfHigh
    const absoluteGain = relativeGain * voi
    return {
      ...s,
      relativeGain,
      absoluteGain,
      annualizedGain: absoluteGain / a.treatmentHorizon,
    }
  })
}

// Conservative (HF=Optimal) annualized implied QALY gain — used for the main
// break-even verdict, per the workbook (Results!C34:C38 reference G25).
export function conservativeImpliedAnnualized(a: Assumptions = ASSUMPTIONS): number {
  return computeHFImplied(a).find((h) => h.key === 'optimal')!.annualizedGain
}

// ---- Deployment scenarios (Results sec. 1, 2 & 4) ----
export interface ScenarioInput {
  key: string
  label: string
  deviceLifetime: number
  patientsPerYear: number
}

export const SCENARIOS: ScenarioInput[] = [
  { key: 's1', label: '5-yr device · 100 pts/yr', deviceLifetime: 5, patientsPerYear: 100 },
  { key: 's2', label: '5-yr device · 250 pts/yr', deviceLifetime: 5, patientsPerYear: 250 },
  { key: 's3', label: '10-yr device · 250 pts/yr', deviceLifetime: 10, patientsPerYear: 250 },
  { key: 's4', label: '5-yr device · 500 pts/yr', deviceLifetime: 5, patientsPerYear: 500 },
]

export interface ScenarioResult extends ScenarioInput {
  annCostLow: number // Results!F  = incLow/(life*pts)
  annCostHigh: number // Results!G = incHigh/(life*pts)
  annCostMid: number // Results!H
  requiredQalyLow: number
  requiredQalyHigh: number
  requiredQalyMid: number // Results!F15.. = midCost/WTP
  impliedConservative: number // HF=Optimal annualized
  breakEvenMultiple: number // implied / required mid
  breaksEven: boolean
}

export function computeScenario(s: ScenarioInput, a: Assumptions = ASSUMPTIONS): ScenarioResult {
  const incLow = incrementalCostLow(a)
  const incHigh = incrementalCostHigh(a)
  const denom = s.deviceLifetime * s.patientsPerYear
  const annCostLow = incLow / denom
  const annCostHigh = incHigh / denom
  const annCostMid = (annCostLow + annCostHigh) / 2

  const requiredQalyLow = annCostLow / a.wtpThreshold
  const requiredQalyHigh = annCostHigh / a.wtpThreshold
  const requiredQalyMid = (requiredQalyLow + requiredQalyHigh) / 2

  const impliedConservative = conservativeImpliedAnnualized(a)
  const breakEvenMultiple = impliedConservative / requiredQalyMid

  return {
    ...s,
    annCostLow,
    annCostHigh,
    annCostMid,
    requiredQalyLow,
    requiredQalyHigh,
    requiredQalyMid,
    impliedConservative,
    breakEvenMultiple,
    breaksEven: breakEvenMultiple >= 1,
  }
}

export function computeAllScenarios(a: Assumptions = ASSUMPTIONS): ScenarioResult[] {
  return SCENARIOS.map((s) => computeScenario(s, a))
}

// ---- Formatting helpers ----
export function fmtCurrency(v: number, digits = 2): string {
  return `C$${v.toFixed(digits)}`
}

// Small QALY values → scientific notation with a superscript exponent string.
export function fmtSci(v: number, sig = 2): { mantissa: string; exponent: number } {
  if (v === 0) return { mantissa: '0', exponent: 0 }
  const exponent = Math.floor(Math.log10(Math.abs(v)))
  const mantissa = (v / Math.pow(10, exponent)).toFixed(sig)
  return { mantissa, exponent }
}

export function fmtSciString(v: number, sig = 2): string {
  const { mantissa, exponent } = fmtSci(v, sig)
  return `${mantissa}×10^${exponent}`
}

export function fmtMultiple(v: number): string {
  return `${Math.round(v).toLocaleString()}×`
}
