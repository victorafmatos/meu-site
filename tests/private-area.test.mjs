import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHandler } from '../netlify/lib/private-area.mjs';
const env = { ADMIN_EMAIL: 'owner@example.com', URL: 'https://example.netlify.app', INSTALLERS_DRIVE_URL: 'https://drive.google.com/drive/folders/secret-folder' };
const owner = { email: env.ADMIN_EMAIL, confirmed_at: '2026-09-04', app_metadata: { roles: ['admin'] } };
const req = (cookie = 'nf_jwt=token') => new Request('https://example.com/area-tecnica', { headers: cookie ? { cookie } : {} });
const handler = (user, settings = env) => createHandler(settings, async (url, options) => {
  assert.equal(url.href, 'https://example.netlify.app/.netlify/identity/user');
  assert.equal(options.headers.Authorization, 'Bearer token');
  return Response.json(user);
});
test('unconfigured fails closed', async () => assert.equal((await handler(owner, {})(req())).status, 503));
test('anonymous redirects to login', async () => assert.equal((await handler(owner)(req(''))).headers.get('location'), '/login/'));
for (const [name, user] of [['wrong email', { ...owner, email: 'other@example.com' }], ['no admin', { ...owner, app_metadata: {} }], ['unconfirmed', { ...owner, confirmed_at: null }]]) {
  test(name, async () => { const response = await handler(user)(req()); assert.equal(response.status, 403); assert.ok(!(await response.text()).includes('secret-folder')); });
}
test('invalid token denied', async () => assert.equal((await createHandler(env, async () => new Response(null, { status: 401 }))(req())).status, 401));
test('upstream failure fails closed', async () => assert.equal((await createHandler(env, async () => { throw Error(); })(req())).status, 503));
test('owner gets panel without caching', async () => { const response = await handler(owner)(req()); assert.equal(response.status, 200); assert.match(response.headers.get('Cache-Control'), /no-store/); assert.match(await response.text(), /secret-folder/); });
test('unsafe link omitted', async () => assert.ok(!(await (await handler(owner, { ...env, INSTALLERS_DRIVE_URL: 'javascript:alert(1)' })(req())).text()).includes('javascript:')));
test('POST rejected', async () => assert.equal((await handler(owner)(new Request('https://example.com', { method: 'POST' }))).status, 405));
test('legacy page stays identical', async () => assert.equal(await readFile('index.html', 'utf8'), await readFile('Meu site', 'utf8')));
