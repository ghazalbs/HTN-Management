// Raw row from df_glm.csv after column renaming
export interface GLMRow {
  Row: number
  HF: 'O' | 'L' | 'H'       // Human/updating factor
  TF: 'L' | 'M' | 'H'       // Technology/measurement factor
  LBPV: 'L' | 'M' | 'H'    // Long-term BP variability
  SBPV: 'L' | 'M' | 'H'    // Short-term BP variability
  Sex: 'F' | 'M'
  // NVI = (v_PI - v_j) / v_j : normalized value of information
  NVI: number
  // PI_scaled_loss = NVI / (1 + NVI) = (v_PI - v_j) / v_PI
  PI_scaled_loss: number
  NVI_pct: number
  PI_scaled_loss_pct: number
  priority: 'Top 10%' | 'High priority' | 'Moderate priority' | 'Lower priority'
}

// Raw row from risk_profiles.csv
export interface RiskProfileRow {
  Profile: string
  NVI_KF: number
  NVI_DeltaStar: number
  NVI_DeltaL: number
  NVI_DeltaH: number
}

// Long-form risk profile for charting
export interface RiskProfileLong {
  Profile: string
  Strategy: string
  StrategyLabel: string
  NVI: number
  NVI_pct: number
  PI_scaled_loss: number
}

// Component decomposition for strategy matrix
export interface ProfileDecomposition {
  Profile: string
  NVI_KF: number
  NVI_DeltaStar: number
  Tech_loss_PI: number
  Total_loss_PI_DeltaStar: number
  Human_loss_PI_DeltaStar: number
  Tech_share: number
  Human_share: number
  Strategy: string
}

// Factor-level summary
export interface FactorLevelSummary {
  factor: string
  level: string
  n: number
  mean_NVI: number
  median_NVI: number
  sd_NVI: number
  mean_PI_scaled_loss: number
}

// Delay vulnerability group
export interface DelayGroup {
  HF: string
  LBPV: string
  SBPV: string
  Sex: string
  n: number
  mean_NVI: number
  mean_PI_scaled_loss: number
  vulnerability: 'High' | 'Moderate' | 'Lower'
}

export type HFLevel = 'O' | 'L' | 'H'
export type TFLevel = 'L' | 'M' | 'H'
export type LBPVLevel = 'L' | 'M' | 'H'
export type SBPVLevel = 'L' | 'M' | 'H'
export type SexLevel = 'F' | 'M'
