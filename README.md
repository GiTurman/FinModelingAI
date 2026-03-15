# FM Georgia — 60-Month Financial Model

> Next.js financial modeling platform built from the FM.xlsx template.  
> **Territory:** Tbilisi, Georgia | **Currency:** GEL | **Period:** 60 months (Y1–Y6)

---

## Sheets → Pages mapping

| Excel Sheet    | Web Page                    | Route                  |
|----------------|-----------------------------|------------------------|
| Input          | Input                       | `/input`               |
| IS             | Income Statement            | `/income-statement`    |
| BS             | Balance Sheet               | `/balance-sheet`       |
| CF             | Cash Flow                   | `/cash-flow`           |
| Tax & other    | Tax & Other                 | `/tax-other`           |
| Scenarios      | Scenarios                   | `/scenarios`           |
| Seles          | Sales Schedule              | `/sales`               |
| OPEX           | OPEX Schedule               | `/opex`                |
| CAPEX          | CAPEX Schedule              | `/capex`               |
| Investments    | Investments                 | `/investments`         |
| —              | Dashboard (KPIs + Charts)   | `/`                    |

---

## Default Tax Rates (Georgia 2025)

| Tax              | Rate  |
|------------------|-------|
| VAT (დღგ)        | 18%   |
| Corporate Tax    | 15%   |
| Personal Income  | 20%   |
| Pension          | 4%+4% |
| Inflation        | 8%    |
| Loan Rate        | 15%   |
| DSO              | 60d   |

---

## Getting Started

```bash
git clone https://github.com/YOUR/fm-georgia
cd fm-georgia
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

```bash
vercel --prod
# Add GEMINI_API_KEY in Vercel dashboard → Settings → Environment Variables
```
