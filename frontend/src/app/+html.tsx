/**
 * Documento raíz de la web de RN1. Define idioma, metadatos y estilos base y coloca
 * los recursos y scripts generados por Expo Router 58 para hidratar las pantallas.
 * Este archivo interviene en la versión web; las pantallas nativas usan _layout.tsx.
 */

import {
  ScrollViewStyleReset,
  useServerDocumentContext,
} from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { palettes } from '@/theme';

const base = palettes.light;
const webBase = `
  :root { --rn1-surface: ${base.surface}; --rn1-accent: ${base.accent}; --rn1-focus: ${base.focus}; color-scheme: light; font-family: system-ui, -apple-system, sans-serif; text-rendering: optimizeLegibility; }
  body { min-width: 320px; background: ${base.background}; }
  button { -webkit-tap-highlight-color: transparent; }
  :focus-visible { outline: 3px solid var(--rn1-focus) !important; outline-offset: 3px; }
  ::selection { color: var(--rn1-surface); background: var(--rn1-accent); }
`;

export default function Root({ children }: PropsWithChildren) {
  // SDK 58 entrega aquí los recursos y scripts necesarios para activar la web.
  const { htmlAttributes, headNodes, bodyAttributes, bodyNodes } =
    useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nexo · Tu espacio de cuentas</title>
        <meta
          name="description"
          content="Tu perfil, tus preferencias y el control de tu acceso en un mismo lugar."
        />
        <ScrollViewStyleReset />
        <style>{webBase}</style>
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
