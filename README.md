<div align="center">

# 🛡️ TokenShield

**AI-Powered API Security & Token Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

TokenShield is a full-stack SaaS platform that helps teams **detect, monitor, and enforce security policies** around AI API tokens in real time — preventing leaks, controlling costs, and ensuring compliance across every request.

</div>

---

## ✨ Features

| Category | Capabilities |
|---|---|
| 🔍 **Detection** | Real-time token leak detection, prompt injection alerts, anomaly detection |
| 🛡️ **Enforcement** | Request-level policy enforcement, rate limiting, token masking |
| 📊 **Analytics** | Usage dashboards, cost tracking, per-user / per-team breakdowns |
| 🔔 **Alerts** | Slack, Email (SendGrid), and SMS (Twilio) notifications |
| 🔗 **Proxy** | Transparent AI API proxy with zero-latency overhead |
| 👥 **Multi-tenant** | Workspace isolation, role-based access control |
| ⚙️ **Rules Engine** | Custom YAML/DSL rules for fine-grained policy control |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TokenShield                          │
├──────────────────────┬──────────────────────────────────────┤
│   Frontend (Next.js) │         Backend (FastAPI)            │
│   ─────────────────  │  ──────────────────────────────────  │
│   • Dashboard        │  • REST API           /api/v1        │
│   • Analytics        │  • Proxy Layer        /proxy         │
│   • Settings         │  • Detectors          /detectors     │
│   • Rules Editor     │  • Rules Engine       /rules         │
│   • Alerts           │  • Alert System       /alerts        │
│                      │  • Analytics Engine   /analytics     │
├──────────────────────┴──────────────────────────────────────┤
│              Infrastructure (Docker + Helm)                  │
│   PostgreSQL · Redis · Nginx · Traefik · Prometheus          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
tokenshield/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/              # REST API route handlers
│   │   ├── core/             # Auth, config, security
│   │   ├── detectors/        # Token leak & anomaly detectors
│   │   ├── enforcement/      # Policy enforcement engine
│   │   ├── proxy/            # Transparent AI API proxy
│   │   ├── rules/            # Rules DSL engine
│   │   ├── alerts/           # Notification adapters
│   │   ├── analytics/        # Usage & cost analytics
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── config/           # Application configuration
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── worker.py         # Background task worker
│   │   └── database.py       # DB connection setup
│   ├── alembic/              # Database migrations
│   ├── tests/                # Backend test suite
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
│
├── frontend/                 # Next.js 15 TypeScript frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Reusable UI components
│   │   └── lib/              # Utilities & API clients
│   ├── public/               # Static assets
│   ├── package.json
│   └── Dockerfile
│
├── infra/                    # Infrastructure configs
│   ├── docker-compose.yml    # Local development stack
│   ├── docker-compose.prod.yml
│   ├── nginx/                # Nginx reverse proxy config
│   ├── traefik/              # Traefik edge router config
│   ├── monitoring/           # Prometheus + Grafana
│   └── scripts/              # DB init & utility scripts
│
├── helm/                     # Kubernetes Helm charts
├── deployment/               # CI/CD & deployment configs
├── .github/                  # GitHub Actions workflows
├── .env.example              # Environment variable template
├── deploy.sh                 # One-command deploy script
└── ROADMAP.md                # Product roadmap
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** v2+
- **Node.js** 20+ (see `.nvmrc`)
- **Python** 3.11+

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/tokenshield.git
cd tokenshield

# Copy and fill in your environment variables
cp .env.example .env
```

Edit `.env` and provide your actual values:

```env
DB_PASS=your_database_password
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SLACK_BOT_TOKEN=xoxb-...
SENDGRID_API_KEY=SG....
TWILIO_ACCOUNT_SID=AC...
JWT_SECRET_KEY=your_super_secret_key
```

### 2. Start with Docker (Recommended)

```bash
# Start the full stack (DB, backend, frontend, proxy)
cd infra
docker compose up -d

# Check all services are healthy
docker compose ps
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 3. Local Development (Without Docker)

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial data (optional)
python seed.py

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install

# Copy and configure frontend env
cp .env.example .env.local

# Start Next.js dev server
npm run dev
```

---

## 🔧 Configuration

All configuration is managed via environment variables. Copy `.env.example` to `.env` and fill in the required values.

| Variable | Description | Required |
|---|---|---|
| `DB_PASS` | PostgreSQL database password | ✅ |
| `JWT_SECRET_KEY` | JWT signing secret (min 32 chars) | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for proxy & detection | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | ⬜ |
| `SLACK_BOT_TOKEN` | Slack bot token for alerts | ⬜ |
| `SENDGRID_API_KEY` | SendGrid key for email alerts | ⬜ |
| `TWILIO_ACCOUNT_SID` | Twilio SID for SMS alerts | ⬜ |

---

## 🧪 Testing

**Backend tests:**

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

**Frontend tests:**

```bash
cd frontend
npm run test
npm run lint
```

---

## 🚢 Deployment

### Docker Compose (Production)

```bash
cd infra
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes (Helm)

```bash
# Generate Helm chart values
python generate_helm.py

# Deploy to cluster
helm upgrade --install tokenshield ./helm \
  --namespace tokenshield \
  --create-namespace \
  -f helm/values.yaml
```

### One-command Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy, Alembic |
| **Database** | PostgreSQL |
| **Cache / Queue** | Redis |
| **Proxy / Gateway** | Nginx, Traefik |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes + Helm |
| **Monitoring** | Prometheus + Grafana |
| **Alerts** | Slack, SendGrid, Twilio |
| **CI/CD** | GitHub Actions |

---

## 📖 API Reference

Once the backend is running, interactive API documentation is available at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

Key endpoint groups:

| Prefix | Description |
|---|---|
| `/api/v1/auth` | Authentication & JWT management |
| `/api/v1/proxy` | AI API transparent proxy |
| `/api/v1/rules` | Policy rules CRUD |
| `/api/v1/alerts` | Alert configuration |
| `/api/v1/analytics` | Usage & cost analytics |
| `/api/v1/detectors` | Anomaly & leak detectors |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the full product roadmap including planned features for:

- AI Workflow Automation
- Multi-model support (OpenAI, Claude, Gemini, Mistral)
- AI Agent system with memory
- RAG & fine-tuning
- Enterprise SSO/SAML & audit logs
- Marketplace & white-label licensing

---

## 🔒 Security

If you discover a security vulnerability, please **do not** open a public issue. Email us directly at **security@tokenshield.io**.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the TokenShield Team

</div>
