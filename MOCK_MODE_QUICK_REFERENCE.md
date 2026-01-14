# Mock Mode Quick Reference

## TL;DR

Mock mode has **2 control points** with **clear priority**:

1. **MOCK_MODE** environment variable (`.env`) - **ALWAYS WINS**
2. **ENFORCE_MOCK_MODE** constant (`lib/constants.ts`) - Used when env not set

## Quick Decision Table

| ENFORCE_MOCK_MODE | MOCK_MODE env | Result |
|:-----------------:|:-------------:|:------:|
| `true` | *not set* | 🟢 MOCK |
| `true` | `"true"` | 🟢 MOCK |
| `true` | `"false"` | 🔴 REAL |
| `false` | *not set* | 🔴 REAL |
| `false` | `"true"` | 🟢 MOCK |
| `false` | `"false"` | 🔴 REAL |

## Common Tasks

### Change Default for All Developers

```typescript
// lib/constants.ts
export const ENFORCE_MOCK_MODE = true;  // or false
```

Then commit and push.

### Override for Your Local Development

```bash
# .env.local (gitignored)
MOCK_MODE=false  # or true
```

### Production Deployment

```bash
# .env.production
MOCK_MODE=false
```

Always explicitly set to false in production.

### Check Current Mode

```bash
npm run dev

# Look for log:
[config] Mock mode enabled: via MOCK_MODE env variable (true)
# or
[config] Mock mode enabled: via ENFORCE_MOCK_MODE constant (true)
# or no log = real mode
```

## Files Modified

| File | Purpose |
|------|---------|
| `lib/constants.ts` | Define ENFORCE_MOCK_MODE constant |
| `lib/config.ts` | Logic to combine constant + env |
| `.env` | Runtime override (optional) |
| `.env.example` | Template with documentation |

## Priority Flow

```
Start
  ↓
Is MOCK_MODE env set?
  ↓
YES → Use MOCK_MODE value → Done
  ↓
NO → Use ENFORCE_MOCK_MODE value → Done
```

## Environment-Specific Configs

```bash
# Development (uses constant)
# No MOCK_MODE in .env
# Result: ENFORCE_MOCK_MODE (currently true)

# Staging (override to real)
MOCK_MODE=false
# Result: Real data

# Demo (override to mock)
MOCK_MODE=true
# Result: Mock data

# Production (override to real)
MOCK_MODE=false
# Result: Real data (safe!)
```

## Troubleshooting One-Liners

```bash
# Check what ENFORCE_MOCK_MODE is set to
grep "ENFORCE_MOCK_MODE =" lib/constants.ts

# Check if MOCK_MODE env is set
grep "MOCK_MODE" .env

# See final computed value in logs
npm run dev 2>&1 | grep "Mock mode"
```

## Best Practices

✅ **DO:**
- Set `ENFORCE_MOCK_MODE=true` for development repos
- Set `MOCK_MODE=false` explicitly in production .env
- Use `MOCK_MODE` env for temporary overrides
- Commit `ENFORCE_MOCK_MODE` changes to version control

❌ **DON'T:**
- Leave production without explicit `MOCK_MODE=false`
- Assume constant will protect production (always set env)
- Commit `.env` files with sensitive overrides

## Complete Documentation

For full details, see:
- `MOCK_MODE.md` - Comprehensive guide
- `README.md` - Configuration section
- `lib/constants.ts` - Inline documentation
