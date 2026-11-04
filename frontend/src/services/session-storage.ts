/**
 * Guía de lectura. Persistencia nativa del token mediante SecureStore. No almacena la
 * contraseña del usuario; el servidor debe seguir validando la sesión en cada solicitud
 * protegida.
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'rn1.session';
export const readSession = () => SecureStore.getItemAsync(KEY);
export const saveSession = (token: string) =>
  SecureStore.setItemAsync(KEY, token);
export const clearSession = () => SecureStore.deleteItemAsync(KEY);
