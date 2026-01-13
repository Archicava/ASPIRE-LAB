# ASPIRE - Documentație Tehnică

## Arhitectură Generală

**ASPIRE** este o aplicație Next.js cu inferență descentralizată prin **Ratio1 Edge Node local**. Toate operațiunile de storage și procesare se fac prin API-uri on-edge containerizate, fără dependențe cloud.

## Stack Tehnologic

### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.4.5
- **UI Library**: React 18.3.1
- **Componente**:
  - `@headlessui/react` - primitivi UI accesibili
  - `recharts` - vizualizare date
  - `clsx` - conditional classNames
- **Validare**: Zod 3.23.8

### Backend
- **Runtime**: Node.js prin Next.js App Router
- **API Pattern**: RESTful routes în `app/api/*`
- **Persistență**: CStore (Chainstore) pentru records structurate
- **File Storage**: R1FS (Ratio1 File System) pentru payloaduri criptate

### Autentificare & Securitate
- **Library**: `@ratio1/cstore-auth-ts`
- **Session**: Cookie-uri HMAC-signed cu TTL configurabil
- **Password Hashing**: Argon2 (`@node-rs/argon2`)
- **Session Cookie**: `r1-session` (httpOnly, sameSite: lax, secure în prod)

### Integrare Ratio1
- **SDK**: `@ratio1/edge-sdk-ts`
- **Pattern Client**: Singleton instances pentru server și browser
- **HTTP**: `cross-fetch` pentru Node.js

## Arhitectură Inferență - Local On-Edge API Calls

### Pattern Integrat Edge Node

Toate operațiunile de inferență și storage comunică cu un **Ratio1 Edge Node containerizat rulând local**.

### Flux Submisie Caz

```
Client → POST /api/cases
  ↓
Server-side handler (storeCaseSubmission):
  1. Generare case ID: R1-YYYYMMDD-{timestamp}
  2. Generare job ID: JOB-{timestamp}
  3. Serializare payload JSON + base64
  4. Upload R1FS:
     client.r1fs.addFileBase64(base64)
     → Returns: {cid, ee_node_address}
  5. Store case în CStore:
     client.cstore.hset(casesHKey, caseId, record)
  6. Store job în CStore:
     client.cstore.hset(jobsHKey, jobId, jobRecord)
     Status: "queued"
  7. Return case record cu artifact metadata
```

### Configurare Environment

**Variabile obligatorii** (`.env`):
```bash
# CStore & R1FS endpoints
R1EN_CHAINSTORE_API_URL=http://localhost:8080
R1EN_R1FS_API_URL=http://localhost:8081

# Auth
R1EN_CSTORE_AUTH_HKEY=aspire-auth
R1EN_CSTORE_AUTH_SECRET=<secret>
R1EN_CSTORE_AUTH_BOOTSTRAP_ADMIN_PWD=<admin_pwd>
AUTH_SESSION_SECRET=<hmac_secret>

# Optional
R1EN_CHAINSTORE_PEERS=[]
```

**Aliasuri suportate**: `EE_CHAINSTORE_API_URL`, `EE_R1FS_API_URL`, etc.

### Inițializare Clienti SDK

**Fișier**: `lib/ratio1-client.ts`

```typescript
// Server-side (Node.js)
const serverClient = createEdgeSdkNodeClient({
  cstoreApiUrl: config.chainstore.apiUrl,
  r1fsApiUrl: config.r1fs.apiUrl,
  peers: config.chainstore.peers
});

// Browser
const browserClient = createEdgeSdkBrowserClient({
  cstoreApiUrl: config.chainstore.apiUrl,
  r1fsApiUrl: config.r1fs.apiUrl
});
```

**Pattern**: Singleton cu lazy initialization.

### Operațiuni Date

**Fișier**: `lib/data-platform.ts`

| Funcție | Scop |
|---------|------|
| `storeCaseSubmission(data)` | Creează caz + job, upload R1FS, store CStore |
| `loadCaseRecords()` | Fetch toate cazurile (`hgetall`) |
| `loadCaseRecord(id)` | Fetch un caz (`hget`) |
| `loadInferenceJobs()` | Fetch toate joburile |
| `loadInferenceJob(id)` | Fetch un job |
| `loadPlatformStatus()` | Health check CStore + R1FS |

### Lifecycle Status Job

```
queued → [Edge Node procesează] → running → succeeded/failed
```

Status tracked în CStore cu timestamps pentru istoric.

### Hash Keys CStore (configurabile)

```
ratio1-asd-cases → Case records (key: case ID)
ratio1-asd-jobs → Job records (key: job ID)
```

## API Routes

### Autentificare (`/api/auth/*`)

| Route | Method | Funcție |
|-------|--------|---------|
| `/api/auth/login` | POST | Autentificare CStore, issue session cookie |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/session` | GET | Verify session curentă |

**Flow Login**:
```
1. POST {username, password}
2. simple.authenticate(username, password)
   → returnează user {username, role, displayName}
3. createSession(user) → signed cookie
4. Client stochează token în localStorage
```

**Session Validation**:
- `readSessionFromCookie()` verifică semnătură HMAC + expirare
- TTL default: 7 zile (configurabil `AUTH_SESSION_TTL_HOURS`)

### Cazuri (`/api/cases`)

| Method | Funcție |
|--------|---------|
| GET | Load toate cazurile (auth required) |
| POST | Store caz nou + creează job inferență |

### Utilizatori (`/api/users`)

| Method | Funcție | Role |
|--------|---------|------|
| GET | List users | Admin |
| POST | Create user | Admin |
| PATCH | Update metadata/role | Admin |
| PUT | Change password | Auth (self/admin) |

### Health Checks

| Route | Funcție |
|-------|---------|
| `/api/cstore-status` | Status CStore |
| `/api/r1fs-status` | Status R1FS |

## Componente React

### Core UI (`components/`)

| Component | Scop |
|-----------|------|
| `CaseForm` | Form structurat multi-secțiune pentru cazuri |
| `PredictiveLab` | Scenario builder cu scoring softmax |
| `CaseList` | Browser paginat cazuri |
| `JobTable` | Tabel joburi cu status indicators |
| `AuthContext` | Context React pentru user state |
| `Navbar` | Navigație cu user menu |
| `PlatformStatusCard` | Vizualizare health CStore/R1FS |
| `StatCard` | Display KPI (counts, prevalență, mediane) |
| `StatusIndicator` | Badges live/offline/warning |
| `ProbabilityBars` | Vizualizare distribuții softmax |

### Page Routes

| Route | Auth | Scop |
|-------|------|------|
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/workspace` | Protected | Dashboard operator |
| `/cases` | Protected | Browser cazuri |
| `/cases/new` | Protected | Form submisie caz |
| `/cases/[id]` | Protected | Detalii caz + rezultate |
| `/predict` | Protected | Lab predictiv |
| `/research/insights` | Protected | Research hub |
| `/admin` | Admin | User management |
| `/account` | Protected | Password change |

## Algoritm Predictiv

**Fișier**: `lib/predictive.ts`

### Scoring Softmax

```typescript
function computePrediction(input: PredictiveInput): InferenceResult
```

**3 Fenotipuri TSA**:
1. **Profound ASD cu disregulare senzorială**
2. **High-functioning ASD**
3. **Syndromic ASD**

### Factori Scorare

**Ponderări**:
- Severitate limbaj: +3 profound, +1 high-func
- Anomalii EEG: +2 profound
- Trăsături dismorfice: +3 syndromic
- Comorbidități multiple: +2 syndromic
- Evaluări normale (ADOS/ADIR low): +2 high-func
- Factori prenatali: +1 profound/syndromic
- Întârzieri dezvoltare: distribuție pe categorii

**Normalizare**: Softmax pentru distribuție probabilități

**Output**:
```typescript
{
  topPrediction: string,
  categories: [
    {label, probability, narrative}
  ],
  explanation: string,
  recommendedActions: string[]
}
```

## Tipuri Date & Schema

### CaseSubmission
```typescript
{
  demographics: {
    caseLabel, ageMonths, sex, parentalAge,
    subtype, diagnosticAgeMonths, prenatalFactors[]
  },
  development: {
    delays[], dysmorphicFeatures,
    comorbidities[], regressionObserved
  },
  assessments: {
    adosScore, adirScore, eegAnomalies,
    mriFindings, headCircumference
  },
  behaviors: {
    concerns[], languageLevel, sensoryNotes
  },
  notes: string
}
```

### CaseRecord (CStore)
```typescript
{
  id: "R1-YYYYMMDD-{ts}",
  created: ISO timestamp,
  data: CaseSubmission,
  artifact?: {cid, eeNodeAddress}
}
```

### InferenceJob (CStore)
```typescript
{
  id: "JOB-{ts}",
  caseId: string,
  status: "queued"|"running"|"succeeded"|"failed",
  created: ISO,
  updated: ISO,
  result?: InferenceResult
}
```

## Date Cohortă

### Seed Data (`data/`)

- **cohort-seed.json**: Metrici compacte pentru analytics
- **cohort-cstore.json**: CaseRecord objects normalized

### Generare
```bash
npm run seed:cohort
```

**Script**: `scripts/build-cohort.js` - procesează Excel → JSON

## Securitate

### Password Hashing
- **Algoritm**: Argon2id (state-of-the-art)
- **Library**: `@node-rs/argon2` (native bindings)

### Session Management
- **Signing**: HMAC cu `AUTH_SESSION_SECRET`
- **Storage**: Cookie httpOnly + sameSite: lax
- **Validation**: Verify signature + check expiration
- **TTL**: Configurabil (default 7 zile)

### Role-Based Access Control (RBAC)
- **Roles**: `user`, `admin`
- **Enforcement**: Server-side în API routes
- **UI Guards**: `useAuth()` context pentru protected routes

### Storage Encryption
- **R1FS**: File system criptat pentru payloaduri
- **CStore**: Hash storage securizat
- **Transport**: HTTPS în producție (recommended)

## Configurare Producție

### Environment Variables
- Set toate variabilele din `.env.example`
- **Critic**: `AUTH_SESSION_SECRET` (min 32 bytes random)
- **Critic**: `R1EN_CSTORE_AUTH_BOOTSTRAP_ADMIN_PWD` (parola admin)

### Build & Deploy
```bash
npm run build
npm start
```

### Edge Node Setup
1. Deploy Ratio1 Edge Node containerizat
2. Configurare endpoints în `.env`
3. Health check: `/api/cstore-status`, `/api/r1fs-status`

### Bootstrap Admin
La primul start, sistemul creează cont admin cu:
- Username: `admin`
- Password: din `R1EN_CSTORE_AUTH_BOOTSTRAP_ADMIN_PWD`

## Development

### Local Setup
```bash
npm install
npm run dev
```

### Scripts Utile
- `npm run build` - Build producție
- `npm run seed:cohort` - Regenerare cohort data
- `npm run lint` - TypeScript + linting

### Structură Directoare
```
/app          - Next.js App Router (pages + API routes)
/components   - React components
/lib          - Business logic + SDK clients
/data         - Cohort seed data
/scripts      - Build scripts
/public       - Static assets
```

## Debugging & Monitoring

### Logs
- Server logs: `console.log` în API routes
- Client errors: Browser console
- CStore/R1FS: Check status endpoints

### Health Checks
- **CStore**: `GET /api/cstore-status`
- **R1FS**: `GET /api/r1fs-status`
- **Dashboard**: PlatformStatusCard în `/workspace`

### Troubleshooting
- **Login fails**: Verify CStore auth config + bootstrap admin
- **Job stuck in queued**: Check Edge Node connectivity
- **R1FS upload fails**: Verify R1FS API URL + permissions

## Extensibility

### Adăugare Fenotip Nou
1. Update `lib/predictive.ts` cu scoring rules
2. Update `ProbabilityBars` component pentru display
3. Update narrative templates

### Câmpuri Noi în Form
1. Update `lib/types.ts` - `CaseSubmission`
2. Update `CaseForm` component cu secțiune nouă
3. Update scoring în `lib/predictive.ts` dacă relevant

### Integrare API Externă
- Pattern: Similar cu Ratio1 client
- Singleton instance în `/lib`
- Environment config în `lib/config.ts`

## Performance

### Optimizări
- **Singleton clients**: Evită re-initialization
- **Lazy loading**: Components cu dynamic imports
- **Pagination**: CaseList, JobTable
- **Memoization**: React useMemo pentru computed values

### Bundle Size
- Next.js code splitting automat
- Argon2 ca external module (native)
- Tree-shaking pentru Recharts

## Referințe Cheie

- **SDK Ratio1**: `@ratio1/edge-sdk-ts` documentation
- **Auth Ratio1**: `@ratio1/cstore-auth-ts` documentation
- **Next.js**: https://nextjs.org/docs
- **Argon2**: https://github.com/napi-rs/node-rs

## Contact & Suport

Pentru probleme tehnice sau contribuții, contactați echipa de dezvoltare Archicava.