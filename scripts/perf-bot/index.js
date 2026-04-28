// scripts/perf-bot/index.js
import fs from 'fs/promises';
import { analyzeBundle }   from './bundle.js';
import { auditShadcn }     from './shadcn.js';
import { analyzeVitals }   from './vitals.js';
import { analyzeRTKQuery } from './rerenders.js';   // ← nuevo
import { generateHTMLReport } from './reporter.js'; // ← nuevo

async function run() {
  console.log('\n=== Performance Bot ===\n');

  console.log('Analizando bundle...');
  const bundleResult = await analyzeBundle();

  console.log('Auditando shadcn...');
  const shadcnResult = await auditShadcn();

  console.log('Analizando RTK Query...');           // ← nuevo
  const rtkResult = await analyzeRTKQuery();

  console.log('Midiendo Web Vitals...');
  const vitalsResult = await analyzeVitals();

  const allIssues = [
    ...bundleResult.issues,
    ...shadcnResult.issues,
    ...rtkResult.issues,      // ← nuevo
    ...vitalsResult.issues,
  ];

  const deductions = { HIGH: 20, MEDIUM: 10, LOW: 3, INFO: 0 };
  const score = Math.max(0, 100 - allIssues.reduce((acc, i) => acc + (deductions[i.severity] ?? 0), 0));

  const report = {
    timestamp: new Date().toISOString(),
    score,
    summary: {
      high:   allIssues.filter(i => i.severity === 'HIGH').length,
      medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
      low:    allIssues.filter(i => i.severity === 'LOW').length,
    },
    bundle:  bundleResult,
    shadcn:  shadcnResult,
    rtk:     rtkResult,       // ← nuevo
    vitals:  vitalsResult,
    issues:  allIssues,
  };

  // JSON (para CI/CD)
  await fs.writeFile('perf-report.json', JSON.stringify(report, null, 2));

  // HTML visual (para humanos)                     // ← nuevo
  const htmlPath = await generateHTMLReport(report);

  console.log(`\nScore: ${score}/100`);
  console.log(`Issues: HIGH=${report.summary.high} | MEDIUM=${report.summary.medium} | LOW=${report.summary.low}`);
  console.log(`\nReportes:`);
  console.log(`  JSON → perf-report.json`);
  console.log(`  HTML → ${htmlPath}`);   // ← nuevo

  const MIN_SCORE = parseInt(process.env.PERF_MIN_SCORE || '60');
  if (score < MIN_SCORE) {
    console.error(`\nScore ${score} menor al mínimo ${MIN_SCORE}`);
    process.exit(1);
  }
}

run().catch(console.error);