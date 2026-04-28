// scripts/perf-bot/shadcn.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_PATH = path.resolve(__dirname, '../../src');

export async function auditShadcn() {
  // Encontrar todos los archivos TSX/TS del proyecto
  const files = await glob('**/*.{tsx,ts}', { cwd: SRC_PATH, absolute: true });

  const usedComponents = new Set();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    // Capturar: import { Button } from "@/components/ui/button"
    const matches = content.matchAll(/from ['"]@\/components\/ui\/([^'"]+)['"]/g);
    for (const match of matches) {
      // Normalizar: "button" o "Button" → "button"
      usedComponents.add(match[1].toLowerCase());
    }
  }

  // Leer qué componentes shadcn están instalados físicamente
  const uiPath = path.join(SRC_PATH, 'components/ui');
  let installedFiles = [];
  try {
    const entries = await fs.readdir(uiPath);
    installedFiles = entries
      .filter(f => f.endsWith('.tsx'))
      .map(f => f.replace('.tsx', '').toLowerCase());
  } catch {
    return { issues: [], used: [...usedComponents], unused: [] };
  }

  const unused = installedFiles.filter(c => !usedComponents.has(c));

  const issues = unused.map(c => ({
    type: 'SHADCN_NO_USADO',
    component: c,
    severity: 'LOW',
    fix: `Eliminar con: npx shadcn@latest remove ${c} — o importarlo en algún feature`,
  }));

  // Detectar imports de shadcn que podrían estar duplicando lógica
  // Ej: si usás tanto Dialog como AlertDialog para lo mismo
  const dialogVariants = ['dialog', 'alert-dialog', 'sheet'].filter(c => usedComponents.has(c));
  if (dialogVariants.length > 2) {
    issues.push({
      type: 'DIALOG_DUPLICADO',
      components: dialogVariants,
      severity: 'LOW',
      fix: 'Revisar si todos los variants de modal son necesarios o se puede unificar',
    });
  }

  return { used: [...usedComponents], unused, issues };
}