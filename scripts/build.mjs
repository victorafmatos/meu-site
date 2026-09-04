import { mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'Bancada.png', 'assets/circuitos.svg', 'login.html', 'assets/auth.css']) {
  await copyFile(file, `dist/${file}`);
}
await build({ entryPoints: ['./src/auth.js'], outfile: 'dist/assets/auth.js', bundle: true, minify: true, platform: 'browser', format: 'esm', target: 'es2022' });
