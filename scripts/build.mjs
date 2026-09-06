import { mkdir, copyFile, cp } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'Bancada.png', 'assets/circuitos.svg', 'login.html', 'assets/auth.css']) {
  await copyFile(file, `dist/${file}`);
}
await cp('assets/servicos', 'dist/assets/servicos', { recursive: true });
await copyFile('assets/carrossel.css', 'dist/assets/carrossel.css');
await copyFile('assets/carrossel.js', 'dist/assets/carrossel.js');
await build({ entryPoints: ['./src/auth.js'], outfile: 'dist/assets/auth.js', bundle: true, minify: true, platform: 'browser', format: 'esm', target: 'es2022' });
