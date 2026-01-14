# MOCK_MODE Documentation

## Overview

**MOCK_MODE** is a configuration flag that changes how ASPIRE displays data on the website. When enabled, it shows pre-seeded cohort data instead of querying the live Ratio1 Edge Node CStore database for cases and jobs.

**Important:** Authentication and user management still use the real CStore authentication system. MOCK_MODE only affects **content display**, not **security or authentication**.

## Configuration

Mock mode can be controlled in two ways with a clear priority order:

1. **MOCK_MODE environment variable** (highest priority - always wins)
2. **ENFORCE_MOCK_MODE constant** (fallback when env variable not set)

### Configuration Priority

The system checks for mock mode in this order:

```typescript
// lib/config.ts
const mockMode = process.env.MOCK_MODE !== undefined
  ? process.env.MOCK_MODE === 'true'  // Use env if set
  : ENFORCE_MOCK_MODE;                 // Otherwise use constant
```

**Decision table:**

| ENFORCE_MOCK_MODE (constant) | MOCK_MODE (env) | Final Result | Reason |
|------------------------------|-----------------|--------------|--------|
| `true` | not set | ✅ Mock mode | Constant enforces mock |
| `true` | `"true"` | ✅ Mock mode | Env confirms mock |
| `true` | `"false"` | ❌ Real mode | Env overrides constant |
| `false` | not set | ❌ Real mode | Constant defaults to real |
| `false` | `"true"` | ✅ Mock mode | Env overrides constant |
| `false` | `"false"` | ❌ Real mode | Env confirms real |

### Method 1: Environment Variable (Recommended for deployment)

```bash
# In .env file
MOCK_MODE=true

# To explicitly disable (override constant)
MOCK_MODE=false

# To use constant default (don't set MOCK_MODE at all)
# MOCK_MODE=  # commented out or removed
```

**Use when:**
- Different environments need different modes (dev vs prod)
- You want to override the code constant
- CI/CD pipelines with environment-specific configs

### Method 2: Code Constant (Recommended for default behavior)

```typescript
// lib/constants.ts
export const ENFORCE_MOCK_MODE = true;  // Enable by default
// or
export const ENFORCE_MOCK_MODE = false; // Disable by default
```

**Use when:**
- You want a consistent default for all developers
- Building different distributions (dev build vs prod build)
- Simplifying onboarding (developers don't need to configure .env)

### Method 3: Hybrid (Recommended for teams)

```typescript
// lib/constants.ts - Development default
export const ENFORCE_MOCK_MODE = true;
```

```bash
# .env.production - Production override
MOCK_MODE=false

# .env.development - Follows constant (not set)
# MOCK_MODE not set here, uses ENFORCE_MOCK_MODE=true

# .env.demo - Demo override
MOCK_MODE=true
```

This gives:
- ✅ Developers get mock mode by default (ENFORCE_MOCK_MODE=true)
- ✅ Production explicitly uses real data (MOCK_MODE=false)
- ✅ Demo environments can force mock mode (MOCK_MODE=true)

### Verifying Active Mode

When the application starts, it logs which mode is active:

```bash
# If using ENFORCE_MOCK_MODE constant (MOCK_MODE env not set)
[config] Mock mode enabled: via ENFORCE_MOCK_MODE constant (true)

# If using MOCK_MODE environment variable
[config] Mock mode enabled: via MOCK_MODE env variable (true)

# If mock mode is disabled (no log appears)
```

You can also check at runtime:

```typescript
import { platformConfig } from '@/lib/config';

console.log('Mock mode:', platformConfig.MOCK_MODE);
// true = mock mode active
// false = real mode active
```

### Required Configuration (Even in Mock Mode)

```bash
# CStore and R1FS endpoints (required for authentication)
R1EN_CHAINSTORE_API_URL=http://localhost:8080
R1EN_R1FS_API_URL=http://localhost:8081

# Authentication credentials (required for login)
R1EN_CSTORE_AUTH_HKEY=aspire-auth
R1EN_CSTORE_AUTH_SECRET=your-secret-key
R1EN_CSTORE_AUTH_BOOTSTRAP_ADMIN_PWD=admin-password

# Session signing (required)
AUTH_SESSION_SECRET=your-32-char-secret

# Optional
AUTH_SESSION_COOKIE=r1-session
AUTH_SESSION_TTL_SECONDS=86400
```

## What MOCK_MODE Does

### ✅ Authentication & Security (Works Normally)

| Feature | Behavior in Mock Mode |
|---------|----------------------|
| **User Login** | ✅ Uses real CStore authentication |
| **Password Validation** | ✅ Validates against CStore auth database |
| **Session Management** | ✅ Real HMAC-signed cookies with TTL |
| **User Management** | ✅ Create/update/delete users in CStore |
| **Role-Based Access** | ✅ Admin/user roles enforced |
| **Logout** | ✅ Clears real session cookies |

**Example:** You must login with a valid username and password that exists in CStore. Invalid credentials are rejected.

### 📦 Data Display (Returns Mock Data)

| Feature | Behavior in Mock Mode |
|---------|----------------------|
| **Case List** | 📦 Returns pre-seeded cases from `data/cohort-cstore.json` |
| **Case Details** | 📦 Displays cohort case data (not from CStore) |
| **Inference Jobs** | 📦 Generates mock jobs with various statuses |
| **Job Status** | 📦 Shows queued/running/succeeded/failed (simulated) |
| **Platform Health** | 📦 Returns mock CStore/R1FS status |
| **Cohort Statistics** | 📦 Calculated from pre-seeded cohort data |

**Example:** When you browse `/cases`, you see the Romanian ASD cohort cases from the seed file, not whatever is in your live CStore database.

### 🚫 Data Persistence (Skipped)

| Operation | Behavior in Mock Mode |
|-----------|----------------------|
| **Case Submission** | 🚫 Accepts form but doesn't store in CStore/R1FS |
| **Job Creation** | 🚫 Doesn't create real jobs in CStore |
| **R1FS Upload** | 🚫 Skips file upload to R1FS |
| **Case Updates** | 🚫 Changes not persisted |

**Example:** You can submit a new case through `/cases/new`, and the UI will show success, but the case won't be saved to CStore. After refresh, it won't appear in the list.

## Common Workflows

### Workflow 1: Development Team Default

**Goal:** New developers get mock mode automatically without configuring .env

**Setup:**
```typescript
// lib/constants.ts
export const ENFORCE_MOCK_MODE = true;
```

```bash
# .env (or don't set MOCK_MODE at all)
# MOCK_MODE not set - uses constant default

# Developer experience:
npm install
npm run dev
# ✅ Automatically in mock mode, no configuration needed
```

**Result:** Onboarding simplified, consistent dev experience.

### Workflow 2: Production Deployment

**Goal:** Production always uses real data, regardless of code constant

**Setup:**
```typescript
// lib/constants.ts (unchanged)
export const ENFORCE_MOCK_MODE = true; // Dev default
```

```bash
# .env.production
MOCK_MODE=false  # Explicitly override to real mode

# Production deployment:
NODE_ENV=production npm start
# ❌ Mock mode disabled via environment variable
```

**Result:** Production safe, can't accidentally use mock data.

### Workflow 3: Multi-Environment CI/CD

**Goal:** Different modes for dev, staging, demo, prod

**Setup:**
```typescript
// lib/constants.ts
export const ENFORCE_MOCK_MODE = true; // Reasonable default
```

```bash
# .env.development (not set, uses constant)
# MOCK_MODE not set → Mock mode active

# .env.staging (real data for testing)
MOCK_MODE=false

# .env.demo (mock data for presentations)
MOCK_MODE=true

# .env.production (real data)
MOCK_MODE=false
```

**CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Environment
  env:
    MOCK_MODE: ${{ secrets.MOCK_MODE_OVERRIDE }}
  run: |
    npm run build
    npm run deploy
```

**Result:** Flexible per-environment configuration.

### Workflow 4: Feature Branch Testing

**Goal:** Test with real data temporarily without changing code

**Setup:**
```typescript
// lib/constants.ts (unchanged)
export const ENFORCE_MOCK_MODE = true;
```

```bash
# Temporary .env.local (gitignored)
MOCK_MODE=false  # Override for this developer only

npm run dev
# ❌ Mock mode disabled for this session
```

**Result:** Individual developers can override without affecting team.

### Workflow 5: Demo Build

**Goal:** Create a distribution that's always in mock mode

**Setup:**
```typescript
// For demo build, change constant
export const ENFORCE_MOCK_MODE = true;
```

```bash
# No .env needed, constant enforces mock

# Build demo distribution
npm run build:demo
# ✅ Always mock mode, can't be changed by end user
```

**Result:** Demo version guaranteed to show safe data.

## Use Cases

### 1. Development Without Real Data

**Scenario:** You're developing UI features and don't want to create test cases in your live CStore database.

**Solution:** Enable MOCK_MODE to work with consistent pre-seeded data while still testing authentication flows.

```bash
MOCK_MODE=true
```

**Benefits:**
- Clean separation of dev and prod data
- Consistent test data across team members
- No risk of corrupting production database

### 2. Demos and Presentations

**Scenario:** You need to demo ASPIRE with professional-looking data without exposing real patient information.

**Solution:** Use MOCK_MODE with the pre-seeded Romanian ASD cohort (anonymized).

**Benefits:**
- Realistic data that looks professional
- No GDPR concerns (anonymized cohort)
- Consistent demo experience every time

### 3. UI/UX Testing

**Scenario:** Designers want to test layouts and interactions with various data states.

**Solution:** Mock mode provides cases with different characteristics (age ranges, diagnosis types, etc.).

**Benefits:**
- Test edge cases (empty states, long text, etc.)
- No need to create test data manually
- Fast iteration without database queries

### 4. Onboarding New Team Members

**Scenario:** New developer needs to understand the application without setting up full infrastructure.

**Solution:** Clone repo, set MOCK_MODE=true, and start developing immediately.

**Benefits:**
- Reduced setup time (still need Edge Node for auth)
- Safe exploration without breaking things
- Focus on code, not data management

## Production vs. Mock Mode Comparison

### Production Mode (MOCK_MODE=false)

```
User Login
    ↓
✅ Authenticate via CStore
    ↓
Browse Cases
    ↓
📊 Query CStore for real cases
    ↓
Display Real Data
```

**Data flow:** Real CStore → Real data displayed → Real persistence

### Mock Mode (MOCK_MODE=true)

```
User Login
    ↓
✅ Authenticate via CStore (same as production)
    ↓
Browse Cases
    ↓
📦 Load pre-seeded cohort data (skip CStore query)
    ↓
Display Mock Data
```

**Data flow:** Pre-seeded files → Mock data displayed → No persistence

## Code Implementation

### Where Mock Logic Lives

```typescript
// lib/data-platform.ts

export async function loadCaseRecords(): Promise<CaseRecord[]> {
  if (platformConfig.MOCK_MODE) {
    // Return pre-seeded cohort data
    console.log('[data-platform] MOCK_MODE - returning cohort seed data');
    return getCohortCaseRecords();
  }

  // Production: Query real CStore
  const client = getRatio1NodeClient();
  const response = await client.cstore.hgetall({
    hkey: platformConfig.casesHKey
  });
  return parseHashPayload<CaseRecord>(response).items;
}
```

### Authentication is NOT Mocked

```typescript
// app/api/auth/login/route.ts

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // ALWAYS authenticate properly, even in MOCK_MODE
  const user = await authenticate(username, password);

  // Create real session cookie
  const sessionCookie = createSessionCookie({
    username: user.username,
    role: user.role,
    metadata: user.metadata
  });

  return NextResponse.json({ success: true, user });
}
```

## Data Sources in Mock Mode

### Pre-Seeded Files

| File | Purpose | Records |
|------|---------|---------|
| `data/cohort-seed.json` | Compact case metrics | ~200+ cases |
| `data/cohort-cstore.json` | Full case records | ~200+ cases |

### Mock Job Generator

```typescript
// lib/cohort-data.ts

export function getMockInferenceJobs(): InferenceJob[] {
  const cases = getCohortCaseRecords();
  const statuses = ['succeeded', 'running', 'queued', 'failed'];

  // Generate 10 mock jobs linked to cases
  return cases.slice(0, 10).map((caseRecord, index) => ({
    id: `JOB-${Date.now() + index}`,
    caseId: caseRecord.id,
    status: statuses[index % statuses.length],
    submittedAt: new Date().toISOString(),
    // ... more fields
  }));
}
```

## Switching Between Modes

### Enable Mock Mode (Development)

```bash
# .env
MOCK_MODE=true
```

```bash
# Restart application
npm run dev
```

**Result:** Authentication required, but case data comes from seed files.

### Disable Mock Mode (Production)

```bash
# .env
MOCK_MODE=false
```

```bash
# Restart application
npm start
```

**Result:** All operations use real CStore/R1FS.

## Troubleshooting

### Issue: "Not sure which mode I'm in"

**Solution:** Check the console logs when the app starts:

```bash
npm run dev

# Look for this log:
[config] Mock mode enabled: via MOCK_MODE env variable (true)
# or
[config] Mock mode enabled: via ENFORCE_MOCK_MODE constant (true)
# or (no log = real mode)
```

**Or check in code:**

```typescript
import { platformConfig } from '@/lib/config';
import { ENFORCE_MOCK_MODE } from '@/lib/constants';

console.log('ENFORCE_MOCK_MODE constant:', ENFORCE_MOCK_MODE);
console.log('MOCK_MODE env:', process.env.MOCK_MODE);
console.log('Final mode:', platformConfig.MOCK_MODE);
```

### Issue: "Mock mode not respecting environment variable"

**Cause:** Typo in .env or environment variable not loaded.

**Solution:** Verify:

```bash
# Check .env file
cat .env | grep MOCK_MODE

# Check if it's loaded (after npm run dev)
# In your app code:
console.log('MOCK_MODE env:', process.env.MOCK_MODE);

# Common issues:
# ❌ MOCK_MODE = true  (spaces around =)
# ❌ MOCKMODE=true     (underscore missing)
# ✅ MOCK_MODE=true    (correct)
```

### Issue: "Want to change default for all developers"

**Solution:** Change the constant in `lib/constants.ts`:

```typescript
// Before (mock by default)
export const ENFORCE_MOCK_MODE = true;

// After (real data by default)
export const ENFORCE_MOCK_MODE = false;
```

Then commit this change. All developers without `MOCK_MODE` in their `.env` will use this new default.

### Issue: "Cannot authenticate" in Mock Mode

**Cause:** CStore endpoints not configured or Edge Node not running.

**Solution:** Mock mode still requires valid authentication. Ensure Edge Node is running and endpoints are correct:

```bash
# Check if Edge Node is accessible
curl http://localhost:8080/health
curl http://localhost:8081/health

# Verify .env has correct endpoints
R1EN_CHAINSTORE_API_URL=http://localhost:8080
R1EN_R1FS_API_URL=http://localhost:8081
```

### Issue: "No cases displayed" in Mock Mode

**Cause:** Seed files missing or corrupted.

**Solution:** Regenerate cohort seed data:

```bash
npm run seed:cohort
```

This rebuilds `cohort-seed.json` and `cohort-cstore.json` from source Excel.

### Issue: "Case submission succeeded but doesn't appear in list"

**Cause:** This is expected behavior in Mock Mode.

**Solution:** If you need persistence, disable Mock Mode:

```bash
MOCK_MODE=false
```

### Issue: "Jobs stuck in 'queued' status"

**Cause:** Mock jobs are static snapshots, not real background workers.

**Solution:** This is expected in Mock Mode. Real job processing requires production mode with Edge Node workers.

## Best Practices

### ✅ DO

- **Use Mock Mode for UI development** when you don't need to test persistence
- **Use Mock Mode for demos** to show consistent professional data
- **Keep authentication endpoints configured** even in Mock Mode
- **Document when Mock Mode is enabled** in your development setup
- **Test in production mode before deployment** to verify real CStore integration

### ❌ DON'T

- **Don't use Mock Mode in production** - it's for development/demos only
- **Don't assume authentication is bypassed** - it's always validated
- **Don't expect case submissions to persist** in Mock Mode
- **Don't rely on mock job status changes** - they're static

## Summary

**MOCK_MODE = Content Mocking Only**

| Aspect | Mock Mode |
|--------|-----------|
| Authentication | ✅ Real (CStore) |
| User Management | ✅ Real (CStore) |
| Sessions | ✅ Real (HMAC cookies) |
| Case Display | 📦 Mock (seed files) |
| Job Display | 📦 Mock (generated) |
| Data Persistence | 🚫 Disabled |

**When to use:**
- Development without modifying CStore
- Demos with consistent data
- UI testing with realistic data
- Onboarding new developers

**When NOT to use:**
- Production environments
- Testing data persistence
- Testing real inference workflows
- Validating CStore integration
