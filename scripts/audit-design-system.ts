import fs from 'fs';
import path from 'path';

interface DesignViolation {
  file: string;
  line: number;
  type: 'spacing' | 'color' | 'typography' | 'touch-target';
  message: string;
}

const violations: DesignViolation[] = [];

// Запрещенные значения (не кратные 8px)
const invalidSpacing = ['1px', '2px', '3px', '5px', '6px', '7px', '9px', '10px', '11px'];

// Нестандартные цвета (не из палитры)
const invalidColors = ['#000', '#fff', '#333', '#666', '#999'];

// Исключения (файлы, которые можно пропустить)
const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
  'playwright-report',
  'test-results',
];

function shouldExclude(filePath: string): boolean {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

function auditFile(filePath: string) {
  if (shouldExclude(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Проверка spacing (p-, m-, gap-, space-)
    invalidSpacing.forEach((spacing) => {
      const spacingPatterns = [
        `p-${spacing}`, `m-${spacing}`, `gap-${spacing}`,
        `px-${spacing}`, `py-${spacing}`, `pt-${spacing}`, `pb-${spacing}`,
        `pl-${spacing}`, `pr-${spacing}`,
        `mx-${spacing}`, `my-${spacing}`, `mt-${spacing}`, `mb-${spacing}`,
        `ml-${spacing}`, `mr-${spacing}`,
        `space-x-${spacing}`, `space-y-${spacing}`,
      ];

      spacingPatterns.forEach(pattern => {
        if (line.includes(pattern)) {
          violations.push({
            file: filePath,
            line: index + 1,
            type: 'spacing',
            message: `Используется неправильный spacing: ${pattern} (должно быть кратно 8px: 8px, 16px, 24px, 32px...)`,
          });
        }
      });
    });

    // Проверка цветов
    invalidColors.forEach((color) => {
      if (line.includes(color) && !line.includes('//') && !line.includes('*')) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'color',
          message: `Используется нестандартный цвет: ${color} (используй переменные из палитры: orange-500, gray-900, etc.)`,
        });
      }
    });

    // Проверка touch targets (кнопки должны быть минимум 44px)
    if (line.includes('<button') || line.includes('button:')) {
      // Проверяем height классы
      const tooSmallHeights = ['h-6', 'h-7', 'h-8', 'h-9'];
      tooSmallHeights.forEach(height => {
        if (line.includes(height)) {
          violations.push({
            file: filePath,
            line: index + 1,
            type: 'touch-target',
            message: `Кнопка может быть слишком мала для тапа (${height} = ${parseInt(height.split('-')[1]) * 4}px, минимум 44px). Используй h-11 или больше.`,
          });
        }
      });

      // Проверяем custom heights
      if (line.match(/h-\[(1|2|3|4)?\dpx\]/)) {
        const match = line.match(/h-\[(\d+)px\]/);
        if (match) {
          const height = parseInt(match[1]);
          if (height < 44) {
            violations.push({
              file: filePath,
              line: index + 1,
              type: 'touch-target',
              message: `Кнопка слишком мала для тапа (${height}px, минимум 44px)`,
            });
          }
        }
      }
    }

    // Проверка типографики (избегаем хардкод размеров)
    const hardcodedFontSizes = ['text-[11px]', 'text-[13px]', 'text-[15px]', 'text-[17px]', 'text-[19px]'];
    hardcodedFontSizes.forEach(fontSize => {
      if (line.includes(fontSize)) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'typography',
          message: `Используется нестандартный размер шрифта: ${fontSize}. Используй text-sm, text-base, text-lg, text-xl, etc.`,
        });
      }
    });
  });
}

function auditDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (shouldExclude(filePath)) return;

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      auditDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      auditFile(filePath);
    }
  });
}

// Запускаем аудит
console.log('🔍 Запуск аудита Design System...\n');

const startTime = Date.now();

auditDirectory('./app');
auditDirectory('./components');

const duration = Date.now() - startTime;

// Группируем нарушения по типу
const violationsByType = violations.reduce((acc, v) => {
  if (!acc[v.type]) acc[v.type] = [];
  acc[v.type].push(v);
  return acc;
}, {} as Record<string, DesignViolation[]>);

// Выводим результаты
console.log(`⏱️  Аудит завершен за ${duration}ms\n`);

if (violations.length === 0) {
  console.log('✅ Нарушений не найдено! Код соответствует Design System.');
  process.exit(0);
} else {
  console.log(`❌ Найдено ${violations.length} нарушений:\n`);

  // Показываем статистику по типам
  Object.entries(violationsByType).forEach(([type, viols]) => {
    console.log(`📊 ${type}: ${viols.length} нарушений`);
  });
  console.log();

  // Показываем первые 20 нарушений
  const maxShow = 20;
  violations.slice(0, maxShow).forEach((v) => {
    console.log(`${v.file}:${v.line}`);
    console.log(`  [${v.type}] ${v.message}\n`);
  });

  if (violations.length > maxShow) {
    console.log(`... и еще ${violations.length - maxShow} нарушений\n`);
  }

  console.log('💡 Рекомендации по исправлению:');
  console.log('   - Spacing: используй классы кратные 8px (p-2=8px, p-4=16px, p-6=24px)');
  console.log('   - Colors: используй цвета из палитры (orange-500, gray-900, white/10)');
  console.log('   - Touch targets: минимальная высота кнопок 44px (h-11)');
  console.log('   - Typography: используй стандартные размеры (text-sm, text-base, text-lg)\n');

  process.exit(1);
}
