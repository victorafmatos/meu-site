import { login, logout, handleAuthCallback, acceptInvite, updateUser, requestPasswordRecovery } from '@netlify/identity';
try { if (localStorage.getItem('vm-theme') === 'dark') document.body.classList.add('dark'); } catch {}
const status = document.querySelector('#status');
const say = text => { status.textContent = text; };
document.querySelector('#logout')?.addEventListener('click', async () => {
  try { await logout(); location.replace('/login/'); } catch { say('Não foi possível sair. Tente novamente.'); }
});
const form = document.querySelector('#login-form');
if (form) {
  const submit = document.querySelector('#submit');
  const recover = document.querySelector('#recover');
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');
  let callback;
  try {
    callback = await handleAuthCallback();
    if (callback?.type === 'invite' || callback?.type === 'recovery') {
      document.querySelector('#heading').textContent = 'Defina sua senha';
      document.querySelector('#email-field').hidden = true;
      email.required = false;
      password.autocomplete = 'new-password';
      password.minLength = 12;
      submit.textContent = 'Salvar senha';
      recover.hidden = true;
      say('Use uma senha exclusiva com pelo menos 12 caracteres.');
    } else { say(''); }
    submit.disabled = false;
    recover.disabled = false;
  } catch { say('Link inválido ou expirado. Solicite um novo convite ou recupere sua senha.'); recover.disabled = false; }
  form.addEventListener('submit', async event => {
    event.preventDefault(); submit.disabled = true; say('Validando acesso…');
    try {
      if (callback?.type === 'invite') await acceptInvite(callback.token, password.value);
      else if (callback?.type === 'recovery') await updateUser({ password: password.value });
      else await login(email.value.trim(), password.value);
      password.value = ''; location.replace('/area-tecnica');
    } catch { say('Não foi possível entrar. Confira os dados ou solicite um novo link.'); submit.disabled = false; }
  });
  recover.addEventListener('click', async () => {
    if (!email.value || !email.reportValidity()) { say('Informe seu e-mail para recuperar a senha.'); return; }
    recover.disabled = true;
    try { await requestPasswordRecovery(email.value.trim()); say('Se a conta estiver habilitada, você receberá um e-mail de recuperação.'); }
    catch { say('Não foi possível enviar a solicitação. Tente novamente mais tarde.'); }
    finally { recover.disabled = false; }
  });
}
