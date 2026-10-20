import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoServices } from '../demo/services.js';

test('demo: no publica ni captura correo y mantiene roles separados', async () => {
  const services = await createDemoServices();
  assert.equal('enviarCodigoVerificacion' in services, false);
  assert.equal('enviarEnlaceRecuperacion' in services, false);
  assert.equal(
    (await services.login('demo_admin', 'DemoAcceso123')).usuario.is_admin,
    1,
  );
  assert.equal(
    (await services.login('demo_usuario', 'DemoAcceso123')).usuario.is_admin,
    0,
  );
});
test('demo: registro, duplicados, código de un solo uso y baja', async () => {
  const services = await createDemoServices();
  const data = {
    username: 'prueba',
    email: 'prueba@example.test',
    password: 'PruebaAcceso123',
  };
  const id = await services.crearPersona(data);
  assert.ok(Number.isSafeInteger(id));
  assert.equal(
    (await services.crearPersona({ ...data, username: 'PRUEBA' })).success,
    false,
  );
  const { codigo } = await services.crearCodigoVerificacion(id);
  assert.match(codigo, /^\d{6}$/);
  assert.equal(
    (await services.verificarCodigoVerificacion(id, codigo)).success,
    true,
  );
  assert.equal(
    (await services.verificarCodigoVerificacion(id, codigo)).success,
    false,
  );
  assert.equal(await services.eliminarPersona(id), 1);
  assert.equal(await services.obtenerPersonaPorId(id), undefined);
});
test('demo: el cambio de contraseña conserva solo la sesión actual', async () => {
  const services = await createDemoServices();
  const user = (await services.login('demo_usuario', 'DemoAcceso123')).usuario;
  const current = await services.crearSesion(user.id);
  const other = await services.crearSesion(user.id);
  assert.equal(
    await services.actualizarPasswordConActual(
      user.id,
      'DemoAcceso123',
      'NuevaDemo456',
      current,
    ),
    true,
  );
  assert.equal(
    (await services.login(user.username, 'DemoAcceso123')).success,
    false,
  );
  assert.equal(
    (await services.login(user.username, 'NuevaDemo456')).success,
    true,
  );
  assert.ok(await services.obtenerUsuarioPorSesion(current));
  assert.equal(await services.obtenerUsuarioPorSesion(other), null);
});
test('demo: recuperación respeta el enlace configurado, invalida el anterior y revoca sesiones', async () => {
  const previous = process.env.PASSWORD_RESET_URL;
  process.env.PASSWORD_RESET_URL =
    'exp://192.0.2.1:8092/--/restablecer-contrasena';
  try {
    const services = await createDemoServices();
    const user = (await services.login('demo_usuario', 'DemoAcceso123'))
      .usuario;
    const session = await services.crearSesion(user.id);
    const old = new URL(await services.crearEnlaceRecuperacion(user.id));
    const current = new URL(await services.crearEnlaceRecuperacion(user.id));
    assert.equal(current.protocol, 'exp:');
    assert.equal(current.pathname, '/--/restablecer-contrasena');
    assert.equal(
      (
        await services.restablecerPasswordConToken(
          old.searchParams.get('token'),
          'ResetDemo789',
        )
      ).success,
      false,
    );
    assert.equal(
      (
        await services.restablecerPasswordConToken(
          current.searchParams.get('token'),
          'ResetDemo789',
        )
      ).success,
      true,
    );
    assert.equal(await services.obtenerUsuarioPorSesion(session), null);
    assert.equal(
      (
        await services.restablecerPasswordConToken(
          current.searchParams.get('token'),
          'ResetDemo789',
        )
      ).success,
      false,
    );
  } finally {
    if (previous === undefined) delete process.env.PASSWORD_RESET_URL;
    else process.env.PASSWORD_RESET_URL = previous;
  }
});
test('demo: una instancia nueva no conserva las cuentas temporales', async () => {
  const first = await createDemoServices();
  await first.crearPersona({
    username: 'temporal',
    email: 'temporal@example.test',
    password: 'Temporal123',
  });
  const second = await createDemoServices();
  assert.equal(await second.obtenerPersonaPorUsername('temporal'), undefined);
});
