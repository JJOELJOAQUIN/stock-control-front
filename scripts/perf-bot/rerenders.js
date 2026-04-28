// scripts/perf-bot/rerenders.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_PATH = path.resolve(__dirname, '../../src');

// ─── Patrones que causan re-renders innecesarios ──────────────────────────────

const PATTERNS = [
  {
    // useQuery desestructurando el objeto completo en lugar de solo lo que necesita
    // Ej: const query = useGetProductsQuery() → luego usa query.data, query.isLoading
    // Problema: cualquier cambio en el objeto (isFetching, requestId, etc.) re-renderiza
    regex: /const\s+(\w+)\s*=\s*use\w+Query\([^)]*\)\s*;(?!\s*\/\/\s*ok)/g,
    check: (match, fileContent, filePath) => {
      const varName = match[1];
      // Buscar si más abajo usa varName.data, varName.isLoading, etc. (desestructuración tardía)
      const usesMultiple = (fileContent.match(new RegExp(`${varName}\\.`, 'g')) || []).length > 3;
      const doesntDestructure = !fileContent.includes(`const { `) || 
        !fileContent.includes(`} = use`);
      if (usesMultiple && doesntDestructure) {
        return {
          type: 'RTK_DESTRUCTURING_TARDIO',
          file: filePath,
          severity: 'MEDIUM',
          detail: `Variable "${varName}" accede a múltiples props del resultado — desestructurar directamente`,
          fix: `Cambiar: const ${varName} = useXxxQuery()\n        Por: const { data, isLoading, isError } = useXxxQuery()`,
        };
      }
      return null;
    },
  },
  {
    // selectFromResult ausente en queries que devuelven listas grandes
    // Cuando no filtrás con selectFromResult, cualquier cambio en la lista re-renderiza TODO
    regex: /use(\w+Query)\(([^,)]+)\)(?!\s*,\s*\{[^}]*selectFromResult)/g,
    check: (match, fileContent, filePath) => {
      const hookName = `use${match[1]}`;
      // Solo es problema si el componente mapea/filtra la data
      const usesMap = fileContent.includes('.map(') || fileContent.includes('.filter(');
      const usesSelect = fileContent.includes('selectFromResult');
      if (usesMap && !usesSelect) {
        return {
          type: 'RTK_SIN_SELECT_FROM_RESULT',
          file: filePath,
          hook: hookName,
          severity: 'HIGH',
          detail: `${hookName} sin selectFromResult en componente que filtra/mapea — re-renderiza ante cualquier cambio de la lista`,
          fix: `Agregar selectFromResult: useXxxQuery(arg, { selectFromResult: ({ data }) => ({ items: data?.filter(...) }) })`,
        };
      }
      return null;
    },
  },
  {
    // Múltiples useQuery del mismo endpoint en el mismo archivo
    // Puede ser legítimo, pero frecuentemente indica que falta elevar el query al padre
    regex: /use(\w+Query)/g,
    check: (match, fileContent, filePath) => {
      const allHooks = [...fileContent.matchAll(/use(\w+Query)/g)].map(m => m[1]);
      const counts = {};
      for (const h of allHooks) counts[h] = (counts[h] || 0) + 1;
      const dupes = Object.entries(counts).filter(([, c]) => c > 2);
      if (dupes.length > 0) {
        return {
          type: 'RTK_QUERY_DUPLICADO_EN_COMPONENTE',
          file: filePath,
          hooks: dupes.map(([h, c]) => `use${h} x${c}`),
          severity: 'MEDIUM',
          detail: `Mismo query llamado múltiples veces en el mismo archivo`,
          fix: 'RTK Query cachea automáticamente — si son componentes hijos, el resultado es el mismo. Elevar el query al padre y pasar data como prop.',
        };
      }
      return null;
    },
  },
  {
    // Objeto inline como argumento del query → nueva referencia en cada render
    // Ej: useGetProductsQuery({ page: 1, context: LOCAL }) — el objeto {} es nuevo cada vez
    regex: /use\w+Query\(\s*\{[^}]+\}/g,
    check: (match, fileContent, filePath) => {
      return {
        type: 'RTK_ARG_OBJETO_INLINE',
        file: filePath,
        severity: 'MEDIUM',
        detail: 'Objeto literal como argumento del query — nueva referencia en cada render, puede invalidar el cache',
        fix: 'Memoizar el argumento: const queryArg = useMemo(() => ({ page, context }), [page, context])',
      };
    },
  },
  {
    // useQuery dentro de un loop o condicional (viola reglas de hooks)
    regex: /(?:\.map|\.forEach|\.filter|for\s*\(|if\s*\()[^{]*\{[^}]*use\w+Query/g,
    check: (match, fileContent, filePath) => {
      return {
        type: 'RTK_QUERY_EN_LOOP_O_CONDICIONAL',
        file: filePath,
        severity: 'HIGH',
        detail: 'Query dentro de loop o condicional — viola reglas de hooks y causa comportamiento impredecible',
        fix: 'Mover el query fuera del loop. Si necesitás múltiples IDs, usar useQueries() de RTK Query',
      };
    },
  },
  {
    // Falta de tag invalidation — mutations sin invalidatesTags
    regex: /builder\.mutation\s*<[^>]+>\s*\(\s*\{(?![^}]*invalidatesTags)/g,
    check: (match, fileContent, filePath) => {
      return {
        type: 'RTK_MUTATION_SIN_INVALIDATION',
        file: filePath,
        severity: 'HIGH',
        detail: 'Mutation sin invalidatesTags — después de mutar, la UI no se actualiza automáticamente',
        fix: 'Agregar invalidatesTags: ["Product"] (o el tag que corresponda) a la mutation',
      };
    },
  },
];

export async function analyzeRTKQuery() {
  const files = await glob('**/*.{tsx,ts}', { cwd: SRC_PATH, absolute: true });

  const allIssues = [];
  const seen = new Set(); // deduplicar por archivo+tipo

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf-8');
    const relPath = filePath.replace(SRC_PATH + '/', '');

    // Solo analizar archivos que usen RTK Query
    if (!content.includes('useQuery') && !content.includes('useMutation') && !content.includes('builder.')) {
      continue;
    }

    for (const pattern of PATTERNS) {
      const matches = [...content.matchAll(pattern.regex)];
      for (const match of matches) {
        const issue = pattern.check(match, content, relPath);
        if (!issue) continue;

        const key = `${relPath}::${issue.type}`;
        if (seen.has(key)) continue;
        seen.add(key);

        allIssues.push(issue);
        break; // un issue por patrón por archivo es suficiente
      }
    }
  }

  // Stats generales
  const rtkFiles = files.filter(async f => {
    const c = await fs.readFile(f, 'utf-8');
    return c.includes('useQuery') || c.includes('useMutation');
  });

  return {
    filesAnalyzed: files.length,
    rtkFilesFound: allIssues.length > 0 ? [...new Set(allIssues.map(i => i.file))].length : 0,
    issues: allIssues,
  };
}