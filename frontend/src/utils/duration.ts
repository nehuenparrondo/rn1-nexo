/** Formatea segundos como mm:ss; evita valores visuales como 00:60. */
export function formatRemainingTime(seconds: number): string {
  const remaining = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
}
