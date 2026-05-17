import type {
  GLMRow,
  RiskProfileRow,
  RiskProfileLong,
  ProfileDecomposition,
  FactorLevelSummary,
  DelayGroup,
} from '../types'

// NVI = (v_PI - v_j) / v_j
// PI_scaled_loss = NVI / (1 + NVI) = (v_PI - v_j) / v_PI
export function piScaledLoss(nvi: number): number {
  return nvi / (1 + nvi)
}

export function quantile(sorted: number[], p: number): number {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export function mean(vals: number[]): number {
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function median(vals: number[]): number {
  const s = [...vals].sort((a, b) => a - b)
  return quantile(s, 0.5)
}

export function stddev(vals: number[]): number {
  const m = mean(vals)
  return Math.sqrt(vals.reduce((acc, v) => acc + (v - m) ** 2, 0) / vals.length)
}

export function enrichGLMRows(
  raw: Array<Record<string, string>>
): GLMRow[] {
  const parsed = raw.map((r) => {
    // Map NVI_SIL column (actual column name) to NVI field
    const nviKey = r['NVI_SIL'] !== undefined ? 'NVI_SIL' : 'V'
    const nvi = parseFloat(r[nviKey] ?? '0')
    const psl = piScaledLoss(nvi)
    return {
      Row: parseInt(r['Row'] ?? '0', 10),
      HF: r['F1_Human'] as GLMRow['HF'],
      TF: r['F2_Tech'] as GLMRow['TF'],
      LBPV: r['F3_LBPV'] as GLMRow['LBPV'],
      SBPV: r['F4_SBPV'] as GLMRow['SBPV'],
      Sex: r['Sex'] as GLMRow['Sex'],
      NVI: nvi,
      PI_scaled_loss: psl,
      NVI_pct: nvi * 100,
      PI_scaled_loss_pct: psl * 100,
      priority: 'Lower priority' as GLMRow['priority'],
    }
  })

  const sortedNVI = [...parsed.map((r) => r.NVI)].sort((a, b) => a - b)
  const p50 = quantile(sortedNVI, 0.5)
  const p75 = quantile(sortedNVI, 0.75)
  const p90 = quantile(sortedNVI, 0.9)

  return parsed.map((r) => ({
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

export function enrichRiskProfiles(
  raw: Array<Record<string, string>>
): RiskProfileRow[] {
  return raw.map((r) => ({
    // Strip embedded newlines that appear in the CSV profile names
    Profile: r['Profile'].replace(/\n/g, '').trim(),
    NVI_KF: parseFloat(r['NVI_KF'] ?? '0'),
    NVI_DeltaStar: parseFloat(r['NVI_DeltaStar'] ?? '0'),
    NVI_DeltaL: parseFloat(r['NVI_DeltaL'] ?? '0'),
    NVI_DeltaH: parseFloat(r['NVI_DeltaH'] ?? '0'),
  }))
}

export const STRATEGY_ORDER = ['KF', 'SIL_DeltaStar', 'SIL_DeltaL', 'SIL_DeltaH'] as const
export const STRATEGY_LABELS: Record<string, string> = {
  KF: 'KF',
  SIL_DeltaStar: 'SIL-Δ*',
  SIL_DeltaL: 'SIL-ΔL',
  SIL_DeltaH: 'SIL-ΔH',
}

export function toRiskProfileLong(
  profiles: RiskProfileRow[]
): RiskProfileLong[] {
  const rows: RiskProfileLong[] = []
  const colMap: Record<string, keyof RiskProfileRow> = {
    KF: 'NVI_KF',
    SIL_DeltaStar: 'NVI_DeltaStar',
    SIL_DeltaL: 'NVI_DeltaL',
    SIL_DeltaH: 'NVI_DeltaH',
  }
  for (const p of profiles) {
    for (const strategy of STRATEGY_ORDER) {
      const nvi = p[colMap[strategy]] as number
      rows.push({
        Profile: p.Profile,
        Strategy: strategy,
        StrategyLabel: STRATEGY_LABELS[strategy],
        NVI: nvi,
        NVI_pct: nvi * 100,
        PI_scaled_loss: piScaledLoss(nvi),
      })
    }
  }
  return rows
}

// Tech_loss_PI = NVI_KF / (1 + NVI_KF)
// Total_loss_PI_DeltaStar = NVI_DeltaStar / (1 + NVI_DeltaStar)
// Human_loss_PI_DeltaStar = Total_loss_PI_DeltaStar - Tech_loss_PI
// Note: must convert to PI-scaled loss BEFORE subtracting (different denominators)
export function computeProfileDecomposition(
  profiles: RiskProfileRow[]
): ProfileDecomposition[] {
  const medianTech = median(profiles.map((p) => piScaledLoss(p.NVI_KF)))
  const medianHuman = median(
    profiles.map((p) => {
      const techLoss = piScaledLoss(p.NVI_KF)
      const totalLoss = piScaledLoss(p.NVI_DeltaStar)
      return totalLoss - techLoss
    })
  )

  return profiles.map((p) => {
    const techLoss = piScaledLoss(p.NVI_KF)
    const totalLoss = piScaledLoss(p.NVI_DeltaStar)
    const humanLoss = totalLoss - techLoss
    const techShare = totalLoss > 0 ? techLoss / totalLoss : 0
    const humanShare = totalLoss > 0 ? humanLoss / totalLoss : 0

    let strategy = ''
    const aboveMedianTech = techLoss >= medianTech
    const aboveMedianHuman = humanLoss >= medianHuman
    if (aboveMedianTech && aboveMedianHuman) strategy = 'Combined: measurement + updating support'
    else if (aboveMedianTech && !aboveMedianHuman) strategy = 'Measurement technology first'
    else if (!aboveMedianTech && aboveMedianHuman) strategy = 'Decision support first'
    else strategy = 'Lower priority for costly intervention'

    return {
      Profile: p.Profile,
      NVI_KF: p.NVI_KF,
      NVI_DeltaStar: p.NVI_DeltaStar,
      Tech_loss_PI: techLoss,
      Total_loss_PI_DeltaStar: totalLoss,
      Human_loss_PI_DeltaStar: humanLoss,
      Tech_share: techShare,
      Human_share: humanShare,
      Strategy: strategy,
    }
  })
}

type FactorKey = 'HF' | 'TF' | 'LBPV' | 'SBPV' | 'Sex'

export function computeFactorSummaries(rows: GLMRow[]): FactorLevelSummary[] {
  const factors: FactorKey[] = ['HF', 'TF', 'LBPV', 'SBPV', 'Sex']
  const result: FactorLevelSummary[] = []

  for (const factor of factors) {
    const levels = [...new Set(rows.map((r) => r[factor]))].sort()
    for (const level of levels) {
      const subset = rows.filter((r) => r[factor] === level)
      const nvis = subset.map((r) => r.NVI)
      result.push({
        factor,
        level,
        n: subset.length,
        mean_NVI: mean(nvis),
        median_NVI: median(nvis),
        sd_NVI: stddev(nvis),
        mean_PI_scaled_loss: mean(subset.map((r) => r.PI_scaled_loss)),
      })
    }
  }
  return result
}

export function computeLargestDriver(summaries: FactorLevelSummary[]): string {
  const factors = ['HF', 'TF', 'LBPV', 'SBPV', 'Sex']
  let maxRange = -Infinity
  let maxFactor = ''
  for (const factor of factors) {
    const vals = summaries.filter((s) => s.factor === factor).map((s) => s.mean_NVI)
    const range = Math.max(...vals) - Math.min(...vals)
    if (range > maxRange) {
      maxRange = range
      maxFactor = factor
    }
  }
  return maxFactor
}

export function computeHeatmapData(
  rows: GLMRow[]
): Array<{ HF: string; TF: string; Sex: string; mean_NVI: number }> {
  const hfLevels = ['O', 'L', 'H']
  const tfLevels = ['L', 'M', 'H']
  const sexLevels = ['F', 'M']
  const result = []
  for (const sex of sexLevels) {
    for (const hf of hfLevels) {
      for (const tf of tfLevels) {
        const subset = rows.filter((r) => r.HF === hf && r.TF === tf && r.Sex === sex)
        result.push({
          HF: hf,
          TF: tf,
          Sex: sex,
          mean_NVI: subset.length > 0 ? mean(subset.map((r) => r.NVI)) : 0,
        })
      }
    }
  }
  return result
}

export function computeDelayGroups(rows: GLMRow[]): DelayGroup[] {
  const groups: DelayGroup[] = []
  const hfLevels = ['O', 'L', 'H']
  const lbpvLevels = ['L', 'M', 'H']
  const sbpvLevels = ['L', 'M', 'H']
  const sexLevels = ['F', 'M']

  for (const hf of hfLevels) {
    for (const lbpv of lbpvLevels) {
      for (const sbpv of sbpvLevels) {
        for (const sex of sexLevels) {
          const subset = rows.filter(
            (r) => r.HF === hf && r.LBPV === lbpv && r.SBPV === sbpv && r.Sex === sex
          )
          if (subset.length > 0) {
            groups.push({
              HF: hf,
              LBPV: lbpv,
              SBPV: sbpv,
              Sex: sex,
              n: subset.length,
              mean_NVI: mean(subset.map((r) => r.NVI)),
              mean_PI_scaled_loss: mean(subset.map((r) => r.PI_scaled_loss)),
              vulnerability: 'Lower',
            })
          }
        }
      }
    }
  }

  const nviVals = groups.map((g) => g.mean_NVI).sort((a, b) => a - b)
  const p50 = quantile(nviVals, 0.5)
  const p75 = quantile(nviVals, 0.75)

  return groups.map((g) => ({
    ...g,
    vulnerability:
      g.mean_NVI >= p75 ? 'High' : g.mean_NVI >= p50 ? 'Moderate' : 'Lower',
  }))
}

// CSV download helper
export function toCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const keys = Object.keys(data[0])
  const header = keys.join(',')
  const body = data
    .map((row) =>
      keys
        .map((k) => {
          const v = row[k]
          const s = v === null || v === undefined ? '' : String(v)
          return s.includes(',') ? `"${s}"` : s
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function fmt1(v: number): string {
  return v.toFixed(1)
}

export function fmtPct(v: number): string {
  return (v * 100).toFixed(1) + '%'
}
