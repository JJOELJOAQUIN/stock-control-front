// scripts/perf-bot/bundle.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Sube dos niveles: scripts/perf-bot/ → stock-frontend/
const DIST_PATH = path.resolve(__dirname, '../../dist/assets');

export async function analyzeBundle() {
  let files;
  try {
    files = await fs.readdir(DIST_PATH);
  } catch {
    return { issues: [{ type: 'NO_BUILD', severity: 'INFO', description: 'Corré vite build primero o usá perf:ci' }], chunks: [] };
  }

  const chunks = await Promise.all(
    files
      .filter(f => f.endsWith('.js'))
      .map(async f => {
        const stat = await fs.stat(path.join(DIST_PATH, f));
        return { name: f, sizeBytes: stat.size, sizeKb: +(stat.size / 1024).toFixed(1) };
      })
  );

  // Ordenar de mayor a menor
  chunks.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const issues = [];

  for (const chunk of chunks) {
    if (chunk.sizeBytes > 500_000) {
      issues.push({
        type: 'CHUNK_CRITICO',
        file: chunk.name,
        size: `${chunk.sizeKb}kb`,
        severity: 'HIGH',
        fix: 'React.lazy() + Suspense en la ruta que usa este chunk. Verificar si hay deps pesadas (lodash, moment, etc.)',
      });
    } else if (chunk.sizeBytes > 200_000) {
      issues.push({
        type: 'CHUNK_GRANDE',
        file: chunk.name,
        size: `${chunk.sizeKb}kb`,
        severity: 'MEDIUM',
        fix: 'Considerar code splitting. Revisar imports de librerías (usar import named, no default de toda la lib)',
      });
    }
  }

  // Detectar si hay múltiples vendors sin splitting
  const vendorChunks = chunks.filter(c => c.name.includes('vendor') || c.name.includes('index'));
  if (vendorChunks.length === 1 && vendorChunks[0].sizeBytes > 300_000) {
    issues.push({
      type: 'SIN_CODE_SPLITTING',
      severity: 'MEDIUM',
      fix: 'Agregar manualChunks en vite.config.ts para separar react, react-dom, y librerías grandes',
    });
  }

  return { chunks, issues };
}