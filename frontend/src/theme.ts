/**
 * Guía de lectura. Parte del sistema visual: comparte colores, tamaños o preferencia de
 * tema según su implementación. La preferencia de apariencia es independiente de la
 * autenticación y de los datos de las tareas.
 */

import { Platform } from 'react-native';

/** Paletas semánticas compartidas por todas las pantallas. */
export const palettes = {
  light: {
    background: '#f3f6f7',
    surface: '#ffffff',
    muted: '#f5f8fa',
    text: '#142633',
    secondary: '#586d79',
    accent: '#147963',
    accentHover: '#0f6452',
    accentSoft: '#e3f3ed',
    onAccent: '#ffffff',
    danger: '#b83c4b',
    dangerFill: '#b83c4b',
    success: '#147354',
    border: '#dce5e9',
    shadow: '#14263312',
    focus: '#147963',
  },
  dark: {
    background: '#0b1420',
    surface: '#131f2d',
    muted: '#192838',
    text: '#eef4f8',
    secondary: '#a2b4c3',
    accent: '#80dec2',
    accentHover: '#a1ecd6',
    accentSoft: '#1b3a36',
    onAccent: '#102b26',
    danger: '#f17886',
    dangerFill: '#b83c4b',
    success: '#80dec2',
    border: '#293a4b',
    shadow: '#00000030',
    focus: '#80dec2',
  },
};
const systemFont =
  Platform.OS === 'web'
    ? 'system-ui, -apple-system, sans-serif'
    : Platform.OS === 'ios'
      ? 'System'
      : 'sans-serif';
export const fonts = { regular: systemFont, bold: systemFont };

/** Medidas en puntos; los máximos mantienen legibles los formularios grandes. */
export const metrics = {
  authWidth: 520,
  socialWidth: 1120,
  accountWidth: 1040,
  adminWidth: 1240,
  dialogWidth: 480,
  mobileBreakpoint: 760,
  smallBreakpoint: 420,
  gap: 20,
  border: 1,
  radius: 24,
  controlBorder: 1,
  controlRadius: 12,
  controlHeight: 50,
  avatarSize: 64,
  themeSize: 48,
};
export function pagePadding(width: number) {
  return width < 600 ? 20 : width < 1000 ? 36 : 56;
}
export function cardPadding(width: number) {
  return width < 600 ? 24 : 36;
}
export function titleSize(width: number) {
  return width < 600 ? 30 : 36;
}
export function softShadow(color: string) {
  return `0px 12px 40px 0px ${color}`;
}
