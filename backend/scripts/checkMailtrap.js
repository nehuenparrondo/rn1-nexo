import { enviarPruebaCorreo } from '../modules/correo.js';

if (process.env.MAIL_SANDBOX?.trim() === 'false') {
  console.error(
    'Esta prueba solo permite MAIL_SANDBOX=true para no enviar correo real.',
  );
  process.exitCode = 1;
} else {
  try {
    await enviarPruebaCorreo();
    console.log(
      'Mailtrap aceptó “RN1 · Conexión Mailtrap”. Revisá My Sandbox.',
    );
  } catch {
    console.error(
      'No se pudo enviar la prueba. Revisá MAIL_API_KEY, MAIL_INBOX_ID y el límite de envíos de tu plan. La clave no se muestra.',
    );
    process.exitCode = 1;
  }
}
