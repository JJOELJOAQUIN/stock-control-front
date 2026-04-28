// scripts/perf-bot/reporter.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function severityColor(s) {
  return { HIGH: '#E24B4A', MEDIUM: '#EF9F27', LOW: '#639922', INFO: '#378ADD' }[s] || '#888';
}

function severityBg(s) {
  return { HIGH: '#FCEBEB', MEDIUM: '#FAEEDA', LOW: '#EAF3DE', INFO: '#E6F1FB' }[s] || '#F1EFE8';
}

function scoreColor(score) {
  if (score >= 80) return '#3B6D11';
  if (score >= 60) return '#854F0B';
  return '#A32D2D';
}

function scoreBg(score) {
  if (score >= 80) return '#EAF3DE';
  if (score >= 60) return '#FAEEDA';
  return '#FCEBEB';
}

function issueCard(issue) {
  return `
    <div style="border:1px solid ${severityColor(issue.severity)}33;border-left:4px solid ${severityColor(issue.severity)};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:10px;background:${severityBg(issue.severity)};">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="background:${severityColor(issue.severity)};color:#fff;font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;">${issue.severity}</span>
        <code style="font-size:13px;font-weight:500;">${issue.type}</code>
        ${issue.file ? `<span style="margin-left:auto;font-size:11px;color:#5F5E5A;font-family:monospace;">${issue.file}</span>` : ''}
      </div>
      ${issue.detail  ? `<p style="margin:0 0 6px;font-size:13px;color:#444441;">${issue.detail}</p>` : ''}
      ${issue.description ? `<p style="margin:0 0 6px;font-size:13px;color:#444441;">${issue.description}</p>` : ''}
      ${issue.fix     ? `<div style="background:#fff8;border-radius:6px;padding:8px 12px;font-size:12px;font-family:monospace;color:#3C3489;white-space:pre-wrap;">${issue.fix}</div>` : ''}
      ${issue.urls    ? `<ul style="margin:6px 0 0;padding-left:18px;font-size:12px;font-family:monospace;">${issue.urls.map(u => `<li>${u}</li>`).join('')}</ul>` : ''}
    </div>`;
}

function sectionHeader(title, count, color) {
  return `
    <div style="display:flex;align-items:center;gap:12px;margin:28px 0 14px;">
      <h2 style="margin:0;font-size:16px;font-weight:500;">${title}</h2>
      <span style="background:${color}22;color:${color};font-size:12px;padding:2px 10px;border-radius:20px;font-weight:500;">${count} ${count === 1 ? 'issue' : 'issues'}</span>
    </div>`;
}

export async function generateHTMLReport(report) {
  const { score, summary, bundle, shadcn, vitals, rtk, issues, timestamp } = report;

  // Tabla de chunks
  const chunksHTML = bundle?.chunks?.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px;">
        <thead><tr style="border-bottom:1px solid #D3D1C7;">
          <th style="text-align:left;padding:6px 8px;color:#5F5E5A;font-weight:500;">Chunk</th>
          <th style="text-align:right;padding:6px 8px;color:#5F5E5A;font-weight:500;">Tamaño</th>
          <th style="text-align:right;padding:6px 8px;color:#5F5E5A;font-weight:500;"></th>
        </tr></thead>
        <tbody>
          ${bundle.chunks.slice(0, 10).map(c => {
            const pct = Math.min(100, (c.sizeKb / 600) * 100);
            const color = c.sizeKb > 500 ? '#E24B4A' : c.sizeKb > 200 ? '#EF9F27' : '#639922';
            return `<tr style="border-bottom:1px solid #F1EFE8;">
              <td style="padding:6px 8px;font-family:monospace;font-size:12px;">${c.name}</td>
              <td style="padding:6px 8px;text-align:right;font-weight:500;color:${color};">${c.sizeKb}kb</td>
              <td style="padding:6px 8px;width:120px;">
                <div style="background:#F1EFE8;border-radius:4px;height:6px;">
                  <div style="background:${color};width:${pct}%;height:6px;border-radius:4px;"></div>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`
    : '<p style="color:#888;font-size:13px;">No hay datos de bundle. Corré vite build primero.</p>';

  // Vitals cards
  const vitalsData = vitals?.vitals;
  const vitalsHTML = vitalsData
    ? ['fcp', 'ttfb', 'domNodes', 'memoryMb'].map(key => {
        const val = vitalsData[key];
        if (val == null) return '';
        const labels = { fcp: 'FCP', ttfb: 'TTFB', domNodes: 'DOM nodes', memoryMb: 'Heap' };
        const units  = { fcp: 'ms', ttfb: 'ms', domNodes: '', memoryMb: 'MB' };
        const good   = { fcp: 1800, ttfb: 600, domNodes: 1500, memoryMb: 50 };
        const isOk   = val <= good[key];
        return `<div style="background:${isOk ? '#EAF3DE' : '#FCEBEB'};border-radius:10px;padding:14px 18px;text-align:center;min-width:110px;">
          <div style="font-size:22px;font-weight:500;color:${isOk ? '#3B6D11' : '#A32D2D'};">${val}${units[key]}</div>
          <div style="font-size:12px;color:#5F5E5A;margin-top:2px;">${labels[key]}</div>
        </div>`;
      }).join('')
    : '<p style="color:#888;font-size:13px;">No hay datos de vitals. Levantá el dev server y corrés de nuevo.</p>';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Performance Report</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #F8F7F4; margin: 0; padding: 24px; color: #2C2C2A; line-height: 1.5; }
    .card { background: #fff; border: 1px solid #E8E6DF; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    h1 { margin: 0 0 4px; font-size: 22px; font-weight: 500; }
    p  { margin: 0; }
    code { font-family: monospace; font-size: 13px; background: #F1EFE8; padding: 1px 6px; border-radius: 4px; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="card" style="display:flex;align-items:center;gap:24px;">
    <div style="background:${scoreBg(score)};border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="font-size:28px;font-weight:500;color:${scoreColor(score)};">${score}</span>
    </div>
    <div>
      <h1>Performance Report</h1>
      <p style="color:#5F5E5A;font-size:13px;">${new Date(timestamp).toLocaleString('es-AR')} &nbsp;·&nbsp;
        <span style="color:#E24B4A;">${summary.high} HIGH</span> &nbsp;
        <span style="color:#EF9F27;">${summary.medium} MEDIUM</span> &nbsp;
        <span style="color:#639922;">${summary.low} LOW</span>
      </p>
    </div>
    ${score >= 80
      ? `<div style="margin-left:auto;font-size:13px;color:#3B6D11;font-weight:500;">Todo bien</div>`
      : `<div style="margin-left:auto;font-size:13px;color:#A32D2D;font-weight:500;">${issues.filter(i => i.severity === 'HIGH').length} problema${issues.filter(i => i.severity === 'HIGH').length !== 1 ? 's' : ''} crítico${issues.filter(i => i.severity === 'HIGH').length !== 1 ? 's' : ''}</div>`
    }
  </div>

  <!-- Web Vitals -->
  <div class="card">
    <h2 style="margin:0 0 16px;font-size:16px;font-weight:500;">Web Vitals</h2>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">${vitalsHTML}</div>
  </div>

  <!-- Bundle -->
  <div class="card">
    <h2 style="margin:0 0 4px;font-size:16px;font-weight:500;">Bundle</h2>
    <p style="font-size:13px;color:#5F5E5A;margin-bottom:12px;">Top chunks por tamaño</p>
    ${chunksHTML}
  </div>

  <!-- Issues por sección -->
  ${bundle?.issues?.length
    ? `<div class="card">
        ${sectionHeader('Bundle issues', bundle.issues.length, '#EF9F27')}
        ${bundle.issues.map(issueCard).join('')}
      </div>` : ''}

  ${rtk?.issues?.length
    ? `<div class="card">
        ${sectionHeader('RTK Query', rtk.issues.length, '#E24B4A')}
        ${rtk.issues.map(issueCard).join('')}
      </div>` : ''}

  ${vitals?.issues?.length
    ? `<div class="card">
        ${sectionHeader('Runtime / Vitals', vitals.issues.length, '#EF9F27')}
        ${vitals.issues.map(issueCard).join('')}
      </div>` : ''}

  ${shadcn?.issues?.length
    ? `<div class="card">
        ${sectionHeader('shadcn', shadcn.issues.length, '#639922')}
        ${shadcn.issues.map(issueCard).join('')}
      </div>` : ''}

  ${issues.length === 0
    ? `<div class="card" style="text-align:center;padding:40px;">
        <div style="font-size:32px;margin-bottom:8px;">✓</div>
        <p style="color:#3B6D11;font-weight:500;">Sin issues detectados</p>
      </div>` : ''}

</body>
</html>`;

  const outPath = path.resolve(__dirname, '../../perf-report.html');
  await fs.writeFile(outPath, html, 'utf-8');
  return outPath;
}