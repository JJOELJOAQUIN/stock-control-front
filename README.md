
# Análisis completo (necesita dev server corriendo y/o build previo)
npm run perf:full

# Solo bundle (sin dev server, solo revisa dist/)
npm run build && npm run perf

# Solo vitals (el más útil en dev, dejás el server corriendo en otra terminal)
npm run dev
# en otra terminal:
npm run perf

# Apuntar a staging en lugar de localhost
PERF_URL=https://staging.tu-app.com npm run perf
