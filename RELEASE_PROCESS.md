# Release Process

## Overview

Полный процесс подготовки и релиза новой версии в production.

## Files

- `RELEASE_CHECKLIST.md` - мануальный чеклист
- `scripts/preflight-check.ts` - автоматические проверки
- `.github/ISSUE_TEMPLATE/release.md` - GitHub issue template

## Release Cycle

```
Development → Testing → Staging → Production
    ↓            ↓          ↓          ↓
  Feature    Unit Tests  E2E Tests  Monitoring
  Branch     → Passed    → Passed   → 24h
```

## Pre-Release Steps

### 1. Code Freeze (T-3 days)

**Actions**:
- [ ] Announce code freeze in team chat
- [ ] Merge all approved PRs
- [ ] Create release branch: `release/v1.0.0`
- [ ] Update version in package.json

```bash
git checkout -b release/v1.0.0
npm version 1.0.0
git push origin release/v1.0.0
```

### 2. Automated Testing (T-2 days)

**Run all tests**:
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Design audit
pnpm audit:design

# Pre-flight checks
pnpm preflight
```

**Expected results**:
- ✅ All unit tests pass
- ✅ All E2E smoke tests pass
- ⚠️ Design audit: 8 violations (acceptable)
- ✅ Pre-flight checks pass

### 3. Manual Testing (T-1 day)

**Critical flows** (test on staging):

1. **User Registration**
   - [ ] Email registration works
   - [ ] Phone verification works
   - [ ] Profile creation works

2. **Shift Lifecycle**
   - [ ] Client creates shift
   - [ ] Worker applies to shift
   - [ ] Client approves worker
   - [ ] Worker checks in
   - [ ] Shift completes
   - [ ] Ratings submitted

3. **Payments**
   - [ ] Payment creation
   - [ ] YooKassa integration
   - [ ] Payment confirmation
   - [ ] Receipt generation

4. **Admin Panel**
   - [ ] Login with 2FA
   - [ ] User management
   - [ ] Shift monitoring
   - [ ] Financial reports
   - [ ] Audit logs

**Devices**:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Safari

### 4. Performance Audit

**Run Lighthouse**:
```bash
npx lighthouse https://staging.your-domain.com --view
```

**Target scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: 100

**Check bundle size**:
```bash
pnpm build
# Check output for bundle sizes
```

**Target**: < 200KB initial JS bundle

### 5. Security Check

**Scan for vulnerabilities**:
```bash
pnpm audit
```

**Check for secrets**:
```bash
pnpm preflight  # Includes secret scan
```

**Verify**:
- [ ] No high/critical vulnerabilities
- [ ] No hardcoded secrets
- [ ] HTTPS enforced
- [ ] CORS configured correctly

### 6. Database Migration

**Verify migrations**:
```bash
# List pending migrations
supabase db diff

# Apply migrations to staging
supabase db push
```

**Test rollback**:
```bash
# Create rollback script
supabase db dump > backup-pre-migration.sql

# If needed, rollback
psql $DATABASE_URL < backup-pre-migration.sql
```

### 7. Environment Variables

**Verify all env vars set** in Vercel:
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ TELEGRAM_BOT_TOKEN
✅ YOOKASSA_SHOP_ID
✅ YOOKASSA_SECRET_KEY
✅ UPSTASH_REDIS_URL (rate limiting)
✅ SENTRY_DSN (error tracking)
```

### 8. Backup Preparation

**Create pre-release backup**:
```bash
# Supabase dashboard → Database → Backups → Create backup
# Or via CLI:
supabase db dump > backup-v1.0.0-pre-release.sql
```

**Verify backup**:
```bash
# Test restore on local DB
psql local_db < backup-v1.0.0-pre-release.sql
```

## Release Day (T-0)

### Morning (10:00 AM)

**1. Final Checks**:
```bash
pnpm preflight
```

**2. Create GitHub Release**:
- Go to GitHub → Releases → New Release
- Tag: `v1.0.0`
- Title: `Release v1.0.0 - [Feature Summary]`
- Description: Changelog from CHANGELOG.md

**3. Deploy to Production**:

**Option A: Vercel Dashboard**
- Open Vercel dashboard
- Select production deployment
- Deploy latest commit from main

**Option B: CLI**
```bash
vercel --prod
```

**4. Verify Deployment**:
```bash
# Check production URL
curl -I https://your-domain.com

# Verify API health
curl https://your-domain.com/api/health
```

### Post-Deploy (10:30 AM)

**1. Smoke Tests on Production**:

Quick checks:
- [ ] Homepage loads
- [ ] Login works
- [ ] Create shift works
- [ ] Apply to shift works
- [ ] Check-in works

**2. Monitor for 1 Hour**:

Open monitoring dashboards:
- [ ] Vercel Analytics (traffic, errors)
- [ ] Sentry (error rate)
- [ ] Supabase (DB load)
- [ ] UptimeRobot (uptime)

**Watch for**:
- Error rate spike
- Slow response times
- Failed requests
- User complaints

**3. Announce Release**:

Send to team:
```
🚀 Release v1.0.0 deployed to production!

✅ All checks passed
✅ No errors detected
✅ Monitoring active

Features:
- Feature 1
- Feature 2
- Bug fixes

Monitoring: [dashboard link]
```

### Afternoon (2:00 PM)

**1. Verify Metrics**:
- [ ] No error rate increase
- [ ] Response times normal
- [ ] User engagement stable
- [ ] No rollback needed

**2. Update Documentation**:
- [ ] Update README with new version
- [ ] Update API docs if needed
- [ ] Close release issue on GitHub

**3. Retrospective** (optional):
- What went well?
- What could be improved?
- Action items for next release

## Rollback Procedure

If critical issues occur:

### 1. Immediate Rollback (< 5 minutes)

**Vercel**:
- Dashboard → Deployments → Previous deployment → Promote to Production

**Or CLI**:
```bash
vercel rollback
```

### 2. Database Rollback (if needed)

```bash
# Restore from backup
psql $DATABASE_URL < backup-v1.0.0-pre-release.sql
```

### 3. Notify Team

```
🚨 Production rollback initiated

Reason: [description]
Status: Rolling back to v0.9.0
ETA: 5 minutes

Action items:
- [ ] Investigate issue
- [ ] Create hotfix
- [ ] Schedule hotfix deployment
```

### 4. Post-Mortem

Create issue:
- What happened?
- Root cause analysis
- Prevention measures
- Action items

## Hotfix Process

For critical bugs in production:

### 1. Create Hotfix Branch

```bash
git checkout main
git pull
git checkout -b hotfix/critical-bug-fix
```

### 2. Fix and Test

```bash
# Make fix
# Run tests
pnpm test
pnpm test:e2e smoke

# Commit
git commit -m "hotfix: fix critical bug"
```

### 3. Deploy Hotfix

```bash
# Push to GitHub
git push origin hotfix/critical-bug-fix

# Create PR
# Get approval
# Merge to main

# Deploy immediately
vercel --prod
```

### 4. Monitor

Watch for 30 minutes:
- Error rate decreased?
- Issue resolved?
- No new issues?

## Release Calendar

### Weekly Releases (Recommended)

```
Monday:    Code freeze
Tuesday:   Testing
Wednesday: Manual QA
Thursday:  Release day (morning)
Friday:    Monitor, hotfixes if needed
```

### Monthly Major Releases

```
Week 1: Planning
Week 2-3: Development
Week 4: Testing + Release
```

## Versioning

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Examples:
- `1.0.0` → `1.0.1`: Bug fix
- `1.0.1` → `1.1.0`: New feature
- `1.9.0` → `2.0.0`: Breaking change

## Changelog

Update `CHANGELOG.md` before each release:

```markdown
## [1.0.0] - 2026-01-31

### Added
- 2FA authentication for admins
- PWA support with offline mode
- Design system audit tool

### Changed
- Improved payment flow UX
- Updated shift creation form

### Fixed
- Fixed check-in photo upload
- Fixed rating calculation bug

### Security
- Added rate limiting to auth endpoints
```

## Automation

### GitHub Actions

**Auto-deploy to staging** on push to `develop`:
```yaml
# .github/workflows/staging.yml
on:
  push:
    branches: [develop]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/actions/deploy@v1
        with:
          vercel-env: preview
```

**Run tests** on all PRs:
```yaml
# .github/workflows/test.yml
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test
      - run: pnpm test:e2e
      - run: pnpm audit:design
```

## Monitoring Setup

### Sentry

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 1.0,
});
```

### Uptime Robot

Monitor endpoints:
- `https://your-domain.com` (homepage)
- `https://your-domain.com/api/health` (API)
- Interval: 5 minutes
- Alert: Email + Telegram

### Custom Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database
  const dbOk = await checkDatabase();

  // Check external services
  const telegramOk = await checkTelegram();

  return Response.json({
    status: dbOk && telegramOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: { database: dbOk, telegram: telegramOk },
  });
}
```

## Communication

### Pre-Release Announcement

Send to users (optional):
```
Обновление ШЕФ-МОНТАЖ

🚀 Завтра в 10:00 выходит новая версия!

Что нового:
- Двухфакторная аутентификация
- Мобильное приложение (PWA)
- Улучшенный интерфейс

Ожидаемый downtime: ~5 минут
```

### Post-Release Announcement

```
✅ Обновление завершено!

Новая версия v1.0.0 доступна.

Спасибо за терпение! 🙏
```

## Best Practices

1. **Always test on staging first**
2. **Deploy during low-traffic hours** (morning on weekdays)
3. **Monitor for at least 1 hour** after release
4. **Have rollback plan ready**
5. **Communicate with users** about updates
6. **Document everything** in CHANGELOG
7. **Run automated checks** before deploy
8. **Create backups** before major changes
9. **Use feature flags** for risky features
10. **Schedule releases** consistently

## Emergency Contacts

- **Technical Lead**: [name] - [telegram]
- **DevOps**: [name] - [telegram]
- **Support**: [name] - [telegram]

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/migrations)

## Checklist Quick Reference

```bash
# Pre-release
pnpm preflight          # Run all checks
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests
pnpm audit:design      # Design audit
pnpm build             # Build check

# Release
vercel --prod          # Deploy to production

# Post-release
curl -I https://domain.com  # Verify deployment
# Monitor dashboards for 1 hour

# If issues
vercel rollback        # Rollback deployment
```

## Notes

- Keep release process under 30 minutes
- Document any deviations from process
- Update this document after each release
- Automate more checks over time
- Build confidence through successful releases
