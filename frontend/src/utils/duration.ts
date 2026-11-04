/**
 * Guía de lectura. Presentación de una duración como minutos y segundos. La interfaz puede
 * contar hacia cero, pero la decisión de aceptar un código sigue siendo del backend.
 */

/** Formatea segundos como mm:ss; evita valores visuales como 00:60.
 *
 * Para seguir el recorrido: Convierte una cantidad de segundos a texto de minutos y
 * segundos y evita duraciones negativas visibles. Es presentación, no una extensión de la
 * vigencia del código.
 */
export function formatRemainingTime(seconds: number): string {
  const remaining = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
}
