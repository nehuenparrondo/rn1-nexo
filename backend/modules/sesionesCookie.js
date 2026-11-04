export const NOMBRE_COOKIE_SESION = 'sesion_id';

/**
 * Interpreta la cabecera Cookie para encontrar un nombre concreto. Leer el texto no
 * demuestra que la sesión sea válida: esa comprobación requiere consultar la sesión.
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
