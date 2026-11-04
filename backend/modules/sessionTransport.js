/**
 * Guía de lectura. Adapta el transporte de sesión: navegador con cookie, teléfono con
 * Authorization: Bearer. Una cabecera explícita pero mal formada no debe rescatarse usando
 * otra cookie.
 */

import { leerCookie, NOMBRE_COOKIE_SESION } from './sesionesCookie.js';

// Una cabecera Authorization explícita pero inválida nunca debe rescatarse con una cookie.
/**
 * Prioriza una cabecera Authorization explícita y exige formato Bearer válido. Solo cuando
 * esa cabecera no existe intenta la cookie; esto evita mezclar identidades por un
 * encabezado inválido.
 */
export function obtenerTokenSesion(req) {
  const authorization = req.get('authorization');
  if (authorization !== undefined) {
    return /^Bearer ([a-f0-9]{64})$/i.exec(authorization)?.[1] ?? null;
  }
  return leerCookie(req.headers.cookie, NOMBRE_COOKIE_SESION);
}

/**
 * Lee la marca de plataforma para escoger el transporte de la respuesta. Esta marca no
 * demuestra identidad ni permisos: la sesión debe validarse aparte.
 */
export function esClienteNativo(req) {
  return req.get('x-client-platform') === 'native';
}
