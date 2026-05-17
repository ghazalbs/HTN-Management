# HTN Information Value Explorer

A research prototype dashboard for exploring normalized value of information (NVI) results from a hypertension (HTN) management model. Built for academic reviewers.

> **Disclaimer:** This is a research prototype summarizing model-generated scenarios. It is **not** a clinical decision tool and should not be used to diagnose, treat, or manage individual patients.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Data Files

Place the two CSV files in `public/data/`:

```
public/
  data/
    df_glm.csv          ← main scenario data (162 rows)
    risk_profiles.csv   ← risk profile NVI by learning strategy (6 profiles)
```

The files are already copied there if you cloned this repository with the data files present.

### df_glm.csv — Expected columns

| Column | Internal name | Description |
|--------|--------------|-------------|
| Row | Row | Row index |
| F1_Human | HF | Human/updating factor: O=optimal, L=low distortion, H=high distortion |
| F2_Tech | TF | Technology/measurement factor: L=low noise, M=medium, H=high |
| F3_LBPV | LBPV | Long-term BP variability: L/M/H |
| F4_SBPV | SBPV | Short-term BP variability: L/M/H |
| NVI_SIL | NVI | Normalized value of information (raw decimal) |
| Sex | Sex | F or M |

The dashboard computes internally:
- `NVI_pct = NVI × 100`
- `PI_scaled_loss = NVI / (1 + NVI)` — share of perfect-information benchmark lost
- `PI_scaled_loss_pct = PI_scaled_loss × 100`
- Priority tiers based on the 50th, 75th, and 90th percentiles of NVI

### risk_profiles.csv — Expected columns

| Column | Description |
|--------|-------------|
| Profile | e.g. Female_Risk-Free, Male_Smoking |
| NVI_KF | NVI under Kalman Filter learning |
| NVI_DeltaStar | NVI under SIL with calibrated threshold Δ* |
| NVI_DeltaL | NVI under SIL with low threshold ΔL=0 |
| NVI_DeltaH | NVI under SIL with high threshold ΔH=∞ |

## Fallback Mock Data

If either CSV file cannot be loaded (e.g., files are missing), the dashboard automatically falls back to synthetic mock data and displays a banner. The mock data matches the model's structural patterns but is **not** the actual study output.

## Dashboard Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | Executive Summary | Four summary cards: top scenario, mean NVI, largest driver, key insight |
| 2 | Scenario Explorer | Interactive selector; outputs NVI, PI-scaled loss, priority, interpretation |
| 3 | Factor-Level Summary | Bar charts + table of mean NVI by factor and level |
| 4 | HF × TF Heatmap | Heatmap of HF×TF interaction, faceted by sex |
| 5 | Risk Profile Comparison | Line chart of NVI across KF, SIL-Δ*, SIL-ΔL, SIL-ΔH |
| 6 | Strategy Matrix | Scatter plot decomposing tech loss vs human loss |
| 7 | Delay Vulnerability | Proxy for when updating-driven delay is most costly |
| 8 | Takeaways | Four reviewer-facing managerial takeaway boxes |

## Key Formulas

```
NVI^j = (v^PI - v^j) / v^j

PI_scaled_loss = NVI / (1 + NVI) = (v^PI - v^j) / v^PI

Tech_loss_PI   = NVI_KF / (1 + NVI_KF)
Total_loss_PI  = NVI_DeltaStar / (1 + NVI_DeltaStar)
Human_loss_PI  = Total_loss_PI - Tech_loss_PI   ← uses PI-scaled losses, not raw NVI
```

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- PapaParse
- Lucide React (icons)
