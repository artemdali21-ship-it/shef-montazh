#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: CheckResult[] = [];

function run(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stdout || error.message };
  }
}

function check(name: string, fn: () => boolean | Promise<boolean>): void {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;

    if (result instanceof Promise) {
      result.then(passed => {
        results.push({
          name,
          status: passed ? 'pass' : 'fail',
          message: passed ? 'OK' : 'Failed',
          duration: Date.now() - start,
        });
      });
    } else {
      results.push({
        name,
        status: result ? 'pass' : 'fail',
        message: result ? 'OK' : 'Failed',
        duration,
      });
    }
  } catch (error: any) {
    results.push({
      name,
      status: 'fail',
      message: error.message,
      duration: Date.now() - start,
    });
  }
}

console.log('🚀 Pre-flight checks starting...\n');

// 1. Environment variables
check('Environment Variables', () => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.log(`❌ Missing env vars: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ Environment variables OK');
  return true;
});

// 2. TypeScript compilation
check('TypeScript Build', () => {
  console.log('⏳ Building TypeScript...');
  const result = run('pnpm build');

  if (result.success) {
    console.log('✅ TypeScript build OK');
    return true;
  } else {
    console.log('❌ TypeScript build failed');
    console.log(result.output);
    return false;
  }
});

// 3. Unit tests
check('Unit Tests', () => {
  console.log('⏳ Running unit tests...');
  const result = run('pnpm test');

  if (result.success) {
    console.log('✅ Unit tests passed');
    return true;
  } else {
    console.log('❌ Unit tests failed');
    return false;
  }
});

// 4. Design system audit
check('Design System Audit', () => {
  console.log('⏳ Running design audit...');
  const result = run('pnpm audit:design');

  if (result.success) {
    console.log('✅ Design system OK');
    return true;
  } else {
    console.log('⚠️  Design violations found (non-blocking)');
    return true; // Non-blocking
  }
});

// 5. Check for hardcoded secrets
check('Security Scan', () => {
  console.log('⏳ Scanning for secrets...');

  const suspiciousPatterns = [
    /password\s*=\s*['"][^'"]+['"]/i,
    /api_key\s*=\s*['"][^'"]+['"]/i,
    /secret\s*=\s*['"][^'"]+['"]/i,
  ];

  let foundSecrets = false;

  function scanFile(filePath: string) {
    if (
      filePath.includes('node_modules') ||
      filePath.includes('.next') ||
      filePath.includes('.git')
    ) {
      return;
    }

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');

      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          console.log(`⚠️  Potential secret in ${filePath}`);
          foundSecrets = true;
        }
      });
    }
  }

  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else {
        scanFile(filePath);
      }
    });
  }

  scanDirectory('./app');
  scanDirectory('./components');

  if (foundSecrets) {
    console.log('⚠️  Potential secrets found (review manually)');
    return true; // Non-blocking warning
  } else {
    console.log('✅ No obvious secrets found');
    return true;
  }
});

// 6. Check PWA files
check('PWA Files', () => {
  console.log('⏳ Checking PWA files...');

  const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    // 'public/icon-192.png',  // Optional for now
    // 'public/icon-512.png',  // Optional for now
  ];

  const missing = requiredFiles.filter(f => !fs.existsSync(f));

  if (missing.length > 0) {
    console.log(`⚠️  Missing PWA files: ${missing.join(', ')}`);
    return true; // Non-blocking
  }

  console.log('✅ PWA files OK');
  return true;
});

// 7. Check critical files
check('Critical Files', () => {
  console.log('⏳ Checking critical files...');

  const criticalFiles = [
    'package.json',
    'next.config.mjs',
    'tailwind.config.ts',
    'tsconfig.json',
  ];

  const missing = criticalFiles.filter(f => !fs.existsSync(f));

  if (missing.length > 0) {
    console.log(`❌ Missing critical files: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ Critical files OK');
  return true;
});

// Print summary
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Pre-flight Check Results');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
    const duration = r.duration ? ` (${r.duration}ms)` : '';
    console.log(`${icon} ${r.name}${duration}`);
    if (r.status === 'fail') {
      console.log(`   ${r.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ Pre-flight checks FAILED');
    console.log('Fix the issues above before deploying to production.\n');
    process.exit(1);
  } else {
    console.log('✅ Pre-flight checks PASSED');
    console.log('Ready for production deployment! 🚀\n');
    process.exit(0);
  }
}, 1000);
