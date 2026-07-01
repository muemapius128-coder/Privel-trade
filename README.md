privel-trade/
│
├── .github/
│   └── workflows/
│
├── docs/
│   ├── 01-Vision.md
│   ├── 02-Product-Requirements.md
│   ├── 03-Software-Requirements.md
│   ├── 04-System-Architecture.md
│   ├── 05-Database-Design.md
│   ├── 06-API-Design.md
│   ├── 07-UI-UX.md
│   ├── 08-AI-Architecture.md
│   ├── 09-Broker-Architecture.md
│   ├── 10-Development-Roadmap.md
│   ├── 11-Security.md
│   ├── 12-Research-Lab.md
│   ├── 13-Trading-Engine.md
│   ├── 14-Risk-Management.md
│   ├── 15-Deployment.md
│   └── CHANGELOG.md
│
├── design/
│   ├── branding/
│   ├── icons/
│   ├── logos/
│   ├── mockups/
│   ├── wireframes/
│   ├── ui-kit/
│   ├── illustrations/
│   └── .gitkeep
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── brokers/
│   │   │   ├── trading/
│   │   │   ├── ai/
│   │   │   ├── analytics/
│   │   │   ├── journal/
│   │   │   ├── market/
│   │   │   ├── research/
│   │   │   ├── backtesting/
│   │   │   ├── risk/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   │
│   │   ├── common/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── database/
│   │   ├── utils/
│   │   ├── interfaces/
│   │   ├── types/
│   │   └── main.ts
│   │
│   ├── prisma/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   ├── assets/
│   │   ├── themes/
│   │   ├── charts/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── ai/
│   ├── README.md
│   │
│   ├── agents/
│   │   ├── athena/
│   │   ├── da-vinci/
│   │   ├── mercury/
│   │   ├── atlas/
│   │   ├── aegis/
│   │   ├── argus/
│   │   ├── echo/
│   │   ├── market-analyst/
│   │   ├── strategy-advisor/
│   │   ├── research-agent/
│   │   ├── execution-supervisor/
│   │   ├── risk-manager/
│   │   ├── journal-coach/
│   │   └── psychology-coach/
│   │
│   ├── research/
│   │   ├── concept-discovery/
│   │   ├── hypothesis-engine/
│   │   ├── strategy-generator/
│   │   ├── optimizer/
│   │   ├── validation/
│   │   ├── reports/
│   │   └── datasets/
│   │
│   ├── backtesting/
│   │   ├── engine/
│   │   ├── datasets/
│   │   ├── simulations/
│   │   ├── optimization/
│   │   └── reports/
│   │
│   ├── learning/
│   │   ├── books/
│   │   ├── concepts/
│   │   ├── observations/
│   │   ├── market-memory/
│   │   ├── screenshots/
│   │   └── notes/
│   │
│   ├── prompts/
│   ├── models/
│   ├── memory/
│   ├── embeddings/
│   ├── datasets/
│   │
│   ├── knowledge/
│   │   ├── economics/
│   │   ├── psychology/
│   │   ├── statistics/
│   │   ├── smart-money/
│   │   ├── market-microstructure/
│   │   ├── research-papers/
│   │   └── trading-books/
│   │
│   └── strategies/
│       ├── active/
│       ├── experimental/
│       ├── archived/
│       └── generated/
│
├── broker/
│   ├── README.md
│   │
│   ├── common/
│   │   ├── authentication/
│   │   ├── interfaces/
│   │   ├── market-data/
│   │   ├── orders/
│   │   ├── positions/
│   │   ├── websocket/
│   │   └── utils/
│   │
│   ├── forex/
│   │   ├── mt5/
│   │   ├── exness/
│   │   ├── hfm/
│   │   ├── deriv/
│   │   ├── oanda/
│   │   ├── ic-markets/
│   │   ├── pepperstone/
│   │   ├── xm/
│   │   ├── fp-markets/
│   │   └── eightcap/
│   │
│   ├── crypto/
│   │   ├── binance/
│   │   ├── bybit/
│   │   ├── okx/
│   │   ├── kraken/
│   │   ├── coinbase/
│   │   ├── bitget/
│   │   ├── kucoin/
│   │   ├── gate-io/
│   │   ├── mexc/
│   │   └── crypto-com/
│   │
│   ├── stocks/
│   │   ├── alpaca/
│   │   ├── interactive-brokers/
│   │   ├── tradestation/
│   │   ├── robinhood/
│   │   ├── charles-schwab/
│   │   └── future/
│   │
│   ├── futures/
│   │   ├── tradovate/
│   │   ├── ninja-trader/
│   │   ├── interactive-brokers/
│   │   └── future/
│   │
│   ├── options/
│   │   ├── pocket-option/
│   │   ├── quotex/
│   │   ├── nadex/
│   │   └── future/
│   │
│   └── future/
│
├── market-data/
│   ├── forex/
│   ├── crypto/
│   ├── stocks/
│   ├── futures/
│   ├── commodities/
│   ├── indices/
│   ├── economic-calendar/
│   ├── news/
│   ├── sentiment/
│   └── historical/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── backups/
│   └── .gitkeep
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── kubernetes/
│   ├── monitoring/
│   ├── logging/
│   ├── metrics/
│   └── deployment/
│
├── shared/
│   ├── constants/
│   ├── interfaces/
│   ├── types/
│   └── utils/
│
├── scripts/
│   ├── setup/
│   ├── database/
│   ├── deployment/
│   └── maintenance/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── performance/
│   └── security/
│
├── .env.example
├── .editorconfig
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── LICENSE
├── README.md
└── CONTRIBUTING.md
