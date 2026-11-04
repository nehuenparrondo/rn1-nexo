/**
 * Guía de lectura. Transporte de Mailtrap del backend de RN1. Lee configuración privada y
 * distingue el buzón Sandbox mediante sus opciones; crear el mensaje no cambia la cuenta
 * ni valida el código.
 */

import { MailtrapClient } from 'mailtrap';

/** Lee la configuración al enviar, sin fijar un buzón de otra cuenta en el código. */
function transporteCorreo() {
  const token = process.env.MAIL_API_KEY?.trim();
  const mode = process.env.MAIL_SANDBOX?.trim() || 'true';
  if (!['true', 'false'].includes(mode)) {
    throw new Error('MAIL_SANDBOX debe ser true o false.');
  }
  const sandbox = mode === 'true';
  const inboxId = Number(process.env.MAIL_INBOX_ID);
  if (!token || token.startsWith('REEMPLAZAR_')) {
    throw new Error('Configura MAIL_API_KEY en backend/.env.');
  }
  if (sandbox && (!Number.isSafeInteger(inboxId) || inboxId <= 0)) {
    throw new Error(
      'Configura MAIL_INBOX_ID con el ID de tu buzón de Mailtrap.',
    );
  }
  const email =
    process.env.SENDER?.trim() || (sandbox ? 'sandbox@example.com' : '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Configura SENDER con un email de remitente válido.');
  }
  return {
    sender: { email, name: 'Nexo · RN1' },
    client: new MailtrapClient({
      token,
      sandbox,
      ...(sandbox ? { testInboxId: inboxId } : {}),
    }),
  };
}

/** Envía el código; en Sandbox se recibe en Mailtrap, no en el email real.
 *
 * Para seguir el recorrido: Recibe email, usuario y código ya generados y compone el
 * mensaje. En Sandbox el destinatario aparece en el mensaje, pero la entrega se captura en
 * Mailtrap, no en su Gmail.
 */
export async function enviarCodigoVerificacion(datos) {
  const { sender, client } = transporteCorreo();
  await client.send({
    from: sender,
    to: [{ email: datos.email }],
    subject: 'RN1 · Verifica tu correo',
    text: `${datos.username}\nTu código es: ${datos.codigo}\n\nEl código vence en un minuto.`,
    category: 'RN1 · Verificación',
  });
}

/** Conserva el enlace generado por el backend, incluidos los enlaces de Expo Go.
 *
 * Para seguir el recorrido: Compone el mensaje de recuperación con el enlace temporal.
 * Enviarlo no cambia la contraseña: el cambio ocurre al validar el token y enviar la nueva
 * clave.
 */
export async function enviarEnlaceRecuperacion(datos) {
  const { sender, client } = transporteCorreo();
  await client.send({
    from: sender,
    to: [{ email: datos.email }],
    subject: 'RN1 · Restablece tu contraseña',
    text: `${datos.username}\nAbre este enlace para crear una contraseña nueva:\n${datos.enlace}\n\nEl enlace expira en 15 minutos.`,
    category: 'RN1 · Recuperación',
  });
}

/** Diagnóstico explícito: no crea una cuenta ni genera un código de acceso. */
export async function enviarPruebaCorreo() {
  const { sender, client } = transporteCorreo();
  await client.send({
    from: sender,
    to: [{ email: 'prueba-rn1@example.test' }],
    subject: 'RN1 · Conexión Mailtrap',
    text: 'RN1 se conectó con Mailtrap. Este mensaje no contiene códigos de acceso ni requiere ninguna acción.',
    category: 'RN1 · Diagnóstico',
  });
}
