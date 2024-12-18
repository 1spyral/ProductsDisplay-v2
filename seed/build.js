const { build } = require('esbuild');
const path = require('path');

build({
  entryPoints: [path.resolve(__dirname, 'src/seed.ts')],
  bundle: true,
  platform: 'node',
  target: 'esnext',
  outdir: path.resolve(__dirname, 'dist'),
  sourcemap: true,
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  resolveExtensions: ['.ts', '.js'], // Add this line to resolve .ts and .js extensions
}).catch(() => process.exit(1));