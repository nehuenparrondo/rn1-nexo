import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { afterEach, beforeEach, test } from 'node:test';
import { state } from './fixtures/mailtrap-client.js';

const source = new URL('../modules/correo.js', import.meta.url).href;
const mock = new URL('./fixtures/mailtrap-client.js', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'mailtrap' && context.parentURL === source) {
      return { url: mock, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const mail = await import(source);
const keys = ['MAIL_API_KEY', 'MAIL_SANDBOX', 'MAIL_INBOX_ID', 'SENDER'];
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
beforeEach(() => {
  process.env.MAIL_API_KEY = 'token-sintetico-para-pruebas';
  process.env.MAIL_SANDBOX = 'true';
  process.env.MAIL_INBOX_ID = '12345';
  process.env.SENDER = 'sandbox@example.com';
  state.clients.length = 0;
  state.messages.length = 0;
  state.fail = false;
});
afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});
const verification = {
  username: 'prueba',
  email: 'prueba@example.test',
  codigo: '123456',
};

test('correo: rechaza la clave ausente y el placeholder sin enviar', async () => {
  for (const value of ['', 'REEMPLAZAR_CON_TU_TOKEN_DE_MAILTRAP']) {
    process.env.MAIL_API_KEY = value;
    await assert.rejects(
      mail.enviarCodigoVerificacion(verification),
      /MAIL_API_KEY/,
    );
  }
  assert.equal(state.clients.length, 0);
});
test('correo: exige un ID positivo y entero del buzón propio', async () => {
  for (const value of ['', '0', '-1', '1.5', 'abc', '9007199254740992']) {
    process.env.MAIL_INBOX_ID = value;
    await assert.rejects(
      mail.enviarCodigoVerificacion(verification),
      /MAIL_INBOX_ID/,
    );
  }
  assert.equal(state.messages.length, 0);
});
test('correo: usa Sandbox por defecto y el ID configurado', async () => {
  delete process.env.MAIL_SANDBOX;
  await mail.enviarCodigoVerificacion(verification);
  assert.equal(state.clients[0].sandbox, true);
  assert.equal(state.clients[0].testInboxId, 12345);
});
test('correo: elimina espacios exteriores del token y remitente', async () => {
  process.env.MAIL_API_KEY = '  token-de-prueba  ';
  process.env.SENDER = '  sandbox@example.com  ';
  await mail.enviarCodigoVerificacion(verification);
  assert.equal(state.clients[0].token, 'token-de-prueba');
  assert.equal(state.messages[0].from.email, 'sandbox@example.com');
});
test('correo: rechaza un modo ambiguo antes de enviar', async () => {
  process.env.MAIL_SANDBOX = 'falso';
  await assert.rejects(
    mail.enviarCodigoVerificacion(verification),
    /MAIL_SANDBOX/,
  );
});
test('correo: el código conserva destinatario, usuario y contenido', async () => {
  await mail.enviarCodigoVerificacion(verification);
  const message = state.messages[0];
  assert.equal(message.to[0].email, verification.email);
  assert.equal(message.subject, 'RN1 · Verifica tu correo');
  assert.ok(message.text.includes(verification.codigo));
  assert.ok(message.text.includes(verification.username));
  assert.equal(message.from.name, 'Nexo · RN1');
});
test('correo: conserva el enlace profundo de Expo Go en recuperación', async () => {
  const enlace = 'exp://192.0.2.1:8092/--/restablecer-contrasena?token=abc';
  await mail.enviarEnlaceRecuperacion({ ...verification, enlace });
  assert.ok(state.messages[0].text.includes(enlace));
  assert.ok(state.messages[0].text.includes('15 minutos'));
});
test('correo: el diagnóstico no contiene un código de acceso', async () => {
  await mail.enviarPruebaCorreo();
  assert.equal(state.messages[0].subject, 'RN1 · Conexión Mailtrap');
  assert.equal(state.messages[0].to[0].email, 'prueba-rn1@example.test');
});
test('correo: el modo real exige remitente y no utiliza un ID de Sandbox', async () => {
  process.env.MAIL_SANDBOX = 'false';
  process.env.MAIL_INBOX_ID = '';
  process.env.SENDER = '';
  await assert.rejects(mail.enviarCodigoVerificacion(verification), /SENDER/);
  process.env.SENDER = 'remitente@example.test';
  await mail.enviarCodigoVerificacion(verification);
  assert.equal(state.clients[0].sandbox, false);
  assert.equal('testInboxId' in state.clients[0], false);
});
test('correo: propaga el rechazo del proveedor sin simular éxito', async () => {
  state.fail = true;
  await assert.rejects(
    mail.enviarCodigoVerificacion(verification),
    /Fallo simulado/,
  );
  assert.equal(state.messages.length, 0);
});
