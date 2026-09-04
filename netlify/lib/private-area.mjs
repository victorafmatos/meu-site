const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'CDN-Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" };
const page = body => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Área técnica | Victor Matos</title><link rel="stylesheet" href="/assets/auth.css"><script type="module" src="/assets/auth.js"></script></head><body><main>${body}<p id="status" role="status"></p></main></body></html>`;
export function createHandler(env, fetcher = fetch) {
  return async request => {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } });
    const deny = (status, message) => new Response(page(`<h1>Acesso restrito</h1><p>${message}</p><a href="/login/">Ir para o login</a><button id="logout">Sair da conta</button>`), { status, headers });
    if (!env.ADMIN_EMAIL || !env.URL) return deny(503, 'A área técnica aguarda configuração do administrador.');
    const token = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith('nf_jwt='))?.slice(7);
    if (!token) return new Response(null, { status: 303, headers: { ...headers, Location: '/login/' } });
    let user;
    try {
      // Identity validates the token remotely; never trust decoded browser claims.
      const response = await fetcher(new URL('/.netlify/identity/user', env.URL), { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000), redirect: 'error' });
      if (!response.ok) return deny(401, 'Sessão inválida ou expirada. Entre novamente.');
      user = await response.json();
    } catch { return deny(503, 'Não foi possível validar a sessão. Tente novamente.'); }
    if (!user.confirmed_at || user.email?.toLowerCase() !== env.ADMIN_EMAIL.trim().toLowerCase() || !Array.isArray(user.app_metadata?.roles) || !user.app_metadata.roles.includes('admin')) return deny(403, 'Esta conta não tem permissão para acessar o painel.');
    let link = '';
    try { const url = new URL(env.INSTALLERS_DRIVE_URL); if (url.protocol === 'https:' && url.hostname === 'drive.google.com' && !url.username && !url.password && !url.port && /^\/drive\/(?:u\/\d+\/)?folders\/[\w-]+\/?$/.test(url.pathname)) link = url.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;'); } catch {}
    return new Response(page(`<a href="/">← Voltar ao site</a><h1>Área técnica</h1><p>Seus instaladores e ferramentas de trabalho.</p>${link ? `<a class="action" href="${link}" target="_blank" rel="noopener noreferrer">Abrir pasta de instaladores</a><p>O Google Drive também poderá solicitar o login da sua conta.</p>` : '<p>A pasta de instaladores ainda não foi configurada.</p>'}<button class="secondary" id="logout">Sair</button>`), { headers });
  };
}
