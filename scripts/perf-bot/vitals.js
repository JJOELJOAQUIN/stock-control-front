// scripts/perf-bot/vitals.js
import puppeteer from 'puppeteer';

// Por defecto apunta a Vite dev server, pero se puede apuntar a staging
const TARGET_URL = process.env.PERF_URL || 'http://localhost:5173';

export async function analyzeVitals() {
  console.log(`  Abriendo ${TARGET_URL} con Puppeteer...`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage'], // necesario en CI
    });
  } catch (e) {
    return {
      issues: [{ type: 'PUPPETEER_ERROR', severity: 'INFO', description: e.message }],
      vitals: null,
    };
  }

  const page = await browser.newPage();

  // Simular conexión 4G para métricas más realistas
  await page.emulateNetworkConditions({
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 20,
  });

  // Capturar requests para detectar duplicados (síntoma de RTK Query mal configurado)
  const apiRequests = [];
  page.on('request', req => {
    if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
      apiRequests.push(req.url());
    }
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 30_000 });
  } catch (e) {
    await browser.close();
    return {
      issues: [{ type: 'NO_SERVIDOR', severity: 'INFO', description: `No se pudo conectar a ${TARGET_URL}. Levantá el dev server primero.` }],
      vitals: null,
    };
  }

  // Leer métricas de Web Vitals desde el browser
  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || null;

    return {
      fcp: fcp ? Math.round(fcp) : null,
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
      domNodes: document.querySelectorAll('*').length,
      // Memoria disponible en Chrome (no en todos los browsers)
      memoryMb: performance.memory
        ? +(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
        : null,
    };
  });

  await browser.close();

  const issues = [];

  // FCP > 1800ms = lento (Google considera bueno < 1800ms)
  if (vitals.fcp && vitals.fcp > 1800) {
    issues.push({
      type: 'FCP_LENTO',
      value: `${vitals.fcp}ms`,
      severity: vitals.fcp > 3000 ? 'HIGH' : 'MEDIUM',
      fix: 'Revisar: preload de fuentes, reducir CSS bloqueante, lazy loading de rutas con React.lazy()',
    });
  }

  // TTFB > 600ms = servidor lento o build sin compresión
  if (vitals.ttfb && vitals.ttfb > 600) {
    issues.push({
      type: 'TTFB_ALTO',
      value: `${vitals.ttfb}ms`,
      severity: 'MEDIUM',
      fix: 'Habilitar gzip/brotli en el servidor. Verificar que el CDN esté activo.',
    });
  }

  // DOM muy grande = listas sin virtualización
  if (vitals.domNodes > 1500) {
    issues.push({
      type: 'DOM_GIGANTE',
      value: `${vitals.domNodes} nodos`,
      severity: vitals.domNodes > 3000 ? 'HIGH' : 'MEDIUM',
      fix: 'Virtualizar listas con @tanstack/react-virtual. shadcn Table con paginación en lugar de render completo.',
    });
  }

  // Requests duplicados = RTK Query sin cache bien configurado
  const dupes = apiRequests.filter((url, i) => apiRequests.indexOf(url) !== i);
  const uniqueDupes = [...new Set(dupes)];
  if (uniqueDupes.length > 0) {
    issues.push({
      type: 'RTK_REQUESTS_DUPLICADOS',
      urls: uniqueDupes,
      severity: 'HIGH',
      fix: 'Revisar keepUnusedDataFor en tu RTK Query API slice. Asegurar que los componentes compartan el mismo cache tag.',
    });
  }

  return { vitals, apiRequests: apiRequests.length, issues };
}