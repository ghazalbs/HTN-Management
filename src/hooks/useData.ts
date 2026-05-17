import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import type { GLMRow, RiskProfileRow } from '../types'
import { enrichGLMRows, enrichRiskProfiles } from '../utils/calculations'
import { MOCK_GLM, MOCK_RISK_PROFILES } from '../utils/mockData'

interface DataState {
  glmRows: GLMRow[]
  riskProfiles: RiskProfileRow[]
  loading: boolean
  usingMock: boolean
  mockReason: string
}

async function fetchCSV(path: string): Promise<Array<Record<string, string>>> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err: Error) => reject(err),
    })
  })
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    glmRows: [],
    riskProfiles: [],
    loading: true,
    usingMock: false,
    mockReason: '',
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [glmRaw, rpRaw] = await Promise.all([
          fetchCSV('/data/df_glm.csv'),
          fetchCSV('/data/risk_profiles.csv'),
        ])
        if (cancelled) return
        const glmRows = enrichGLMRows(glmRaw)
        const riskProfiles = enrichRiskProfiles(rpRaw)
        setState({ glmRows, riskProfiles, loading: false, usingMock: false, mockReason: '' })
      } catch (e) {
        if (cancelled) return
        console.warn('Could not load CSV files — using mock data:', e)
        setState({
          glmRows: MOCK_GLM,
          riskProfiles: MOCK_RISK_PROFILES,
          loading: false,
          usingMock: true,
          mockReason:
            'Data files could not be loaded from /data/. Displaying synthetic mock data for demonstration.',
        })
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
