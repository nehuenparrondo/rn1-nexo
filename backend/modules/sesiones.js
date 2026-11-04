/**
 * Guía de lectura. Sesiones propias del sistema: relaciona un token aleatorio con una
 * cuenta y un vencimiento. La base conserva el hash del token, mientras el cliente
 * transporta el valor original.
 */

import crypto from 'node:crypto';
import connection from './db.js';

export const NOMBRE_COOKIE_SESION = 'sesion_id';
export const DURACION_SESION_DIAS = 30;

/** Genera un token aleatorio apto para enviarse en una cookie. */
function crearToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** Nunca guardamos el token real: solo este hash irreversible. */
function hashearToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Crea una sesión persistente y devuelve el token que se enviará al navegador.
 *
 * Para seguir el recorrido: Genera un token aleatorio, guarda solo su hash asociado al ID
 * del usuario y devuelve el token original para el transporte al cliente. Crear sesión no
 * crea otra cuenta.
 */
export async function crearSesion(usuarioId, { userAgent, ipAddress }) {
  const token = crearToken();
  const tokenHash = hashearToken(token);

  await connection.query(
    `INSERT INTO sesiones_usuario
      (usuario_id, token_hash, expires_at, created_at, user_agent, ip_address)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${DURACION_SESION_DIAS} DAY), UTC_TIMESTAMP(), ?, ?)`,
    [
      usuarioId,
      tokenHash,
      userAgent?.slice(0, 255) ?? null,
      ipAddress?.slice(0, 45) ?? null,
    ],
  );

  return token;
}

/** Obtiene el usuario dueño de una sesión activa y actualiza su último uso.
 *
 * Para seguir el recorrido: Valida la forma del token, busca su hash en una sesión vigente
 * y no revocada, y devuelve el usuario asociado. También actualiza la fecha de último uso.
 */
export async function obtenerUsuarioPorSesion(token) {
  if (!/^[a-f0-9]{64}$/.test(token ?? '')) return null;

  const tokenHash = hashearToken(token);
  const [filas] = await connection.query(
    `SELECT u.id, u.username, u.email, u.email_verified_at, u.profile_picture, u.is_admin
     FROM sesiones_usuario AS s
     INNER JOIN usuarios AS u ON u.id = s.usuario_id
     WHERE s.token_hash = ?
       AND s.revoked_at IS NULL
       AND s.expires_at > UTC_TIMESTAMP()`,
    [tokenHash],
  );

  if (!filas[0]) return null;

  await connection.query(
    'UPDATE sesiones_usuario SET last_seen_at = UTC_TIMESTAMP() WHERE token_hash = ?',
    [tokenHash],
  );

  return filas[0];
}

/** Revoca la sesión actual al cerrar sesión.
 *
 * Para seguir el recorrido: Marca la sesión como revocada para que el servidor deje de
 * aceptarla. Borrar solo el usuario del estado de React no reemplaza esta operación.
 */
export async function revocarSesion(token) {
  if (!/^[a-f0-9]{64}$/.test(token ?? '')) return;

  await connection.query(
    'UPDATE sesiones_usuario SET revoked_at = UTC_TIMESTAMP() WHERE token_hash = ? AND revoked_at IS NULL',
    [hashearToken(token)],
  );
}

/** Revoca todas las sesiones después de un restablecimiento de contraseña.
 *
 * Para seguir el recorrido: Invalida todas las sesiones de la cuenta después de una
 * operación sensible, por ejemplo un restablecimiento de contraseña.
 */
export async function revocarSesionesDeUsuario(
  usuarioId,
  executor = connection,
) {
  await executor.query(
    'UPDATE sesiones_usuario SET revoked_at = UTC_TIMESTAMP() WHERE usuario_id = ? AND revoked_at IS NULL',
    [usuarioId],
  );
}

/** Conserva la sesión con la que se cambió la contraseña y revoca las demás.
 *
 * Para seguir el recorrido: Invalida las sesiones de otros dispositivos, conservando la
 * que está realizando el cambio de contraseña.
 */
export async function revocarOtrasSesionesDeUsuario(
  usuarioId,
  tokenActual,
  executor = connection,
) {
  if (!/^[a-f0-9]{64}$/.test(tokenActual ?? '')) return;

  await executor.query(
    `UPDATE sesiones_usuario
     SET revoked_at = UTC_TIMESTAMP()
     WHERE usuario_id = ? AND token_hash <> ? AND revoked_at IS NULL`,
    [usuarioId, hashearToken(tokenActual)],
  );
}

/** Lee una cookie concreta sin añadir dependencias externas.
 *
 * Para seguir el recorrido: Interpreta la cabecera Cookie para encontrar un nombre
 * concreto. Leer el texto no demuestra que la sesión sea válida: esa comprobación requiere
 * consultar la sesión.
 */
export function leerCookie(cabeceraCookie, nombre) {
  const cookie = cabeceraCookie
    ?.split(';')
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nombre}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(nombre.length + 1));
  } catch {
    return null;
  }
}

/** Configuración común: JavaScript no puede acceder a la cookie de sesión.
 *
 * Para seguir el recorrido: Configura la duración y las restricciones de la cookie.
 * HttpOnly impide leerla desde el JavaScript de la página; Secure se exige cuando el
 * entorno es producción.
 */
export function opcionesCookieSesion() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DURACION_SESION_DIAS * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
