const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies) {
  const filename = path.join(__dirname, '..', 'src', file);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (!(name in dependencies)) throw new Error('Dependencia inesperada: ' + name);
      return dependencies[name];
    },
  }, { filename });
  return exports;
}

const ui = Object.fromEntries(
  ['Action', 'Actions', 'Avatar', 'AuthLayout', 'Card', 'Copy', 'Feedback', 'Field', 'Screen']
    .map((name) => [name, name]),
);
const user = {
  username: 'alumna_rn1',
  email: 'alumna@example.test',
  email_verified_at: '2026-11-16T12:00:00Z',
  profile_picture: null,
  role: 'user',
};

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}

test('la bienvenida presenta los datos recibidos por props y ejecuta sus callbacks', () => {
  const { WelcomePage } = load('pages/WelcomePage.tsx', { '@/components/ui': ui });
  const calls = [];
  const tree = nodes(WelcomePage({
    user, busy: false, error: '',
    onOpenAccount: () => calls.push('account'),
    onSignOut: () => calls.push('logout'),
  }));
  assert.ok(tree.some((node) => node.type === 'Avatar' && node.props.name === user.username));
  assert.ok(tree.some((node) => JSON.stringify(node.props.children).includes(user.email)));
  tree.find((node) => node.props.label === 'Ir a mi cuenta').props.onPress();
  tree.find((node) => node.props.label === 'Cerrar sesión').props.onPress();
  assert.deepEqual(calls, ['account', 'logout']);
});

test('la bienvenida bloquea acciones durante el cierre y muestra el error recibido', () => {
  const { WelcomePage } = load('pages/WelcomePage.tsx', { '@/components/ui': ui });
  const tree = nodes(WelcomePage({ user, busy: true, error: 'Sin conexión' }));
  assert.ok(tree.filter((node) => node.type === 'Action').every((node) => node.props.disabled));
  assert.equal(tree.find((node) => node.type === 'Feedback').props.error, 'Sin conexión');
});

test('la ruta entrega el perfil de sesión como prop y conecta cuenta y cierre remoto', async () => {
  let closed = false;
  let taskPromise;
  const visited = [];
  const { default: WelcomeScreen } = load('app/bienvenida.tsx', {
    'expo-router': { router: { push: (route) => visited.push(route) } },
    '@/pages/WelcomePage': { WelcomePage: 'WelcomePage' },
    '@/providers/session-provider': {
      useSession: () => ({ user, signOut: async () => { closed = true; } }),
    },
    '@/hooks/use-task': {
      useTask: () => ({ busy: false, error: '', run: (action) => (taskPromise = action()) }),
    },
  });
  const page = WelcomeScreen();
  assert.equal(page.type, 'WelcomePage');
  assert.equal(page.props.user, user);
  page.props.onOpenAccount();
  page.props.onSignOut();
  await taskPromise;
  assert.deepEqual(visited, ['/cuenta']);
  assert.equal(closed, true);
});

function loginScreen(apiLogin) {
  const session = { user: null, accept(response) { this.user = response.usuario; } };
  let draft = 0;
  let pending;
  const task = { busy: false, error: '', run: (action) => (pending = action()) };
  const { default: LoginScreen } = load('app/index.tsx', {
    react: { useState: () => [draft++ % 2 ? 'ClavePrueba123' : 'alumna_rn1', () => {}] },
    'react-native': { View: 'View' },
    'expo-router': { Redirect: 'Redirect', router: {} },
    '@/components/ui': ui,
    '@/components/social-buttons': { SocialButtons: 'SocialButtons' },
    '@/hooks/use-task': { useTask: () => task },
    '@/providers/session-provider': { useSession: () => session },
    '@/providers/social-provider': { useSocial: () => ({ user: null, enabled: false }) },
    '@/services/apiAccess': { login: apiLogin },
  });
  return { render: LoginScreen, session, pending: () => pending };
}

test('login correcto instala el JSON del backend y navega a bienvenida', async () => {
  const screen = loginScreen(async (identifier, password) => {
    assert.equal(identifier, user.username);
    assert.equal(password, 'ClavePrueba123');
    return { usuario: user, verificationExpiresAt: null };
  });
  nodes(screen.render()).find((node) => node.props.testID === 'login-submit').props.onPress();
  await screen.pending();
  assert.equal(screen.session.user, user);
  assert.equal(screen.render().props.href, '/bienvenida');
});

test('login rechazado conserva el formulario sin instalar un perfil', async () => {
  const screen = loginScreen(async () => { throw new Error('Credenciales incorrectas'); });
  nodes(screen.render()).find((node) => node.props.testID === 'login-submit').props.onPress();
  await assert.rejects(screen.pending(), /Credenciales incorrectas/);
  assert.equal(screen.session.user, null);
  assert.equal(screen.render().type, 'AuthLayout');
});

test('una cuenta sin verificar continúa por la verificación antes de la bienvenida', () => {
  const screen = loginScreen();
  screen.session.user = { ...user, email_verified_at: null };
  assert.equal(screen.render().props.href, '/verificar-email');
});
