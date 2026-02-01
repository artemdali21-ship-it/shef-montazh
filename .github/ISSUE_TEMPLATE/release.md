---
name: 🚀 Release Checklist
about: Pre-release verification checklist
title: 'Release v[VERSION] - [DATE]'
labels: release
assignees: ''
---

## Release Information

**Version:** v0.0.0
**Target Date:** YYYY-MM-DD
**Release Manager:** @username

## Pre-Release Checklist

### ✅ Security
- [ ] All API endpoints have authentication
- [ ] RLS enabled on all Supabase tables
- [ ] Rate limiting configured
- [ ] 2FA enabled for all admins
- [ ] No hardcoded secrets in code
- [ ] HTTPS working on all domains

### ✅ Performance
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size < 200KB
- [ ] Lighthouse Score > 90
- [ ] SQL queries have indexes
- [ ] Pagination implemented

### ✅ Functionality
- [ ] Registration/login working
- [ ] Shift creation working (client)
- [ ] Shift application working (worker)
- [ ] Check-in with photo/geolocation working
- [ ] Ratings working
- [ ] Payments working (test mode)
- [ ] Telegram notifications working
- [ ] Search/filters working
- [ ] Chat working (Realtime)
- [ ] Admin panel access restricted

### ✅ Mobile
- [ ] Responsive on iPhone/Android
- [ ] Touch targets >= 44px
- [ ] Scroll working (iOS Safari)
- [ ] Modals opening correctly
- [ ] Keyboard not blocking inputs
- [ ] PWA installable

### ✅ Testing
- [ ] Unit tests passing (`pnpm test`)
- [ ] E2E tests passing (`pnpm test:e2e`)
- [ ] Design audit passing (`pnpm audit:design`)
- [ ] Manual testing complete
- [ ] Cross-browser testing done

### ✅ Monitoring
- [ ] Sentry configured
- [ ] Uptime monitoring active
- [ ] Audit logs working
- [ ] Analytics connected
- [ ] Alerts configured

### ✅ Data
- [ ] Backup configured
- [ ] Test data removed
- [ ] Migrations applied
- [ ] Seeds loaded

### ✅ Deployment
- [ ] Vercel production configured
- [ ] Domain connected
- [ ] SSL active
- [ ] Environment variables set
- [ ] Telegram bot webhook working

## Automated Checks

```bash
pnpm preflight
```

**Result:** [PASS / FAIL]

## Deployment Steps

1. [ ] Run `pnpm preflight` - all checks pass
2. [ ] Merge to main branch
3. [ ] Verify Vercel deployment
4. [ ] Smoke test production
5. [ ] Monitor for 1 hour
6. [ ] Announce release

## Rollback Plan

If issues occur:
1. Revert to previous deployment in Vercel
2. Restore database from backup (if needed)
3. Notify team in Telegram
4. Create hotfix issue

## Notes

[Additional notes or special considerations for this release]

## Sign-off

- [ ] Tested by: @username
- [ ] Approved by: @username
- [ ] Deployed by: @username

---

See [RELEASE_CHECKLIST.md](../../RELEASE_CHECKLIST.md) for detailed checklist.
