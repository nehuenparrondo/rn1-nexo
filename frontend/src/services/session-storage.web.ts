/**
 * Guía de lectura. Variante elegida para web por la resolución de módulos de Expo. El
 * navegador transporta la cookie HttpOnly y no necesita guardar un token en JavaScript.
 */

// Browsers use the backend's HttpOnly cookie, never localStorage for credentials.
export const readSession = async (): Promise<string | null> => null;
export const saveSession = async (_token: string): Promise<void> => {};
export const clearSession = async (): Promise<void> => {};
