// Mock data used as fallback when CSV files cannot be loaded
// Clearly labeled as mock/synthetic data throughout the UI

import type { GLMRow, RiskProfileRow } from '../types'
import { piScaledLoss, quantile } from './calculations'

function genGLM(): GLMRow[] {
  const hfLevels = ['O', 'L', 'H'] as const
  const tfLevels = ['L', 'M', 'H'] as const
  const bpvLevels = ['L', 'M', 'H'] as const
  const sexLevels = ['F', 'M'] as const

  // Approximate NVI values matching paper structure
  const hfBase: Record<string, number> = { O: 0.05, L: 0.08, H: 0.12 }
  const tfBase: Record<string, number> = { L: 0.0, M: 0.04, H: 0.09 }
  const lbpvBase: Record<string, number> = { L: 0.0, M: 0.03, H: 0.07 }
  const sbpvBase: Record<string, number> = { L: 0.0, M: 0.03, H: 0.07 }
  const sexBase: Record<string, number> = { F: 0.0, M: 0.01 }

  const rows: Omit<GLMRow, 'priority'>[] = []
  let rowNum = 1
  for (const sex of sexLevels) {
    for (const hf of hfLevels) {
      for (const tf of tfLevels) {
        for (const lbpv of bpvLevels) {
          for (const sbpv of bpvLevels) {
            const nvi =
              hfBase[hf] + tfBase[tf] + lbpvBase[lbpv] + sbpvBase[sbpv] + sexBase[sex]
            const psl = piScaledLoss(nvi)
            rows.push({
              Row: rowNum++,
              HF: hf,
              TF: tf,
              LBPV: lbpv,
              SBPV: sbpv,
              Sex: sex,
              NVI: nvi,
              PI_scaled_loss: psl,
              NVI_pct: nvi * 100,
              PI_scaled_loss_pct: psl * 100,
            })
          }
        }
      }
    }
  }

  const sorted = [...rows.map((r) => r.NVI)].sort((a, b) => a - b)
  const p50 = quantile(sorted, 0.5)
  const p75 = quantile(sorted, 0.75)
  const p90 = quantile(sorted, 0.9)

  return rows.map((r) => ({
    ...r,
    priority:
      r.NVI >= p90
        ? 'Top 10%'
        : r.NVI >= p75
        ? 'High priority'
        : r.NVI >= p50
        ? 'Moderate priority'
        : 'Lower priority',
  }))
}

function genRiskProfiles(): RiskProfileRow[] {
  return [
    { Profile: 'Female_Risk-Free', NVI_KF: 0.071, NVI_DeltaStar: 0.079, NVI_DeltaL: 0.152, NVI_DeltaH: 0.217 },
    { Profile: 'Female_Smoking', NVI_KF: 0.090, NVI_DeltaStar: 0.096, NVI_DeltaL: 0.174, NVI_DeltaH: 0.249 },
    { Profile: 'Female_Diabetic', NVI_KF: 0.101, NVI_DeltaStar: 0.117, NVI_DeltaL: 0.202, NVI_DeltaH: 0.280 },
    { Profile: 'Male_Risk-Free', NVI_KF: 0.115, NVI_DeltaStar: 0.119, NVI_DeltaL: 0.212, NVI_DeltaH: 0.286 },
    { Profile: 'Male_Smoking', NVI_KF: 0.157, NVI_DeltaStar: 0.192, NVI_DeltaL: 0.313, NVI_DeltaH: 0.406 },
    { Profile: 'Male_Diabetic', NVI_KF: 0.128, NVI_DeltaStar: 0.162, NVI_DeltaL: 0.264, NVI_DeltaH: 0.351 },
  ]
}

export const MOCK_GLM: GLMRow[] = genGLM()
export const MOCK_RISK_PROFILES: RiskProfileRow[] = genRiskProfiles()
