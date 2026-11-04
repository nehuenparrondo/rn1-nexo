/**
 * Guía de lectura. Componente reutilizable icon. Sus props conectan contenido y acciones
 * con el componente que lo usa; para seguir el dato, buscar sus importaciones y los
 * callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import { Image } from 'expo-image';

const paths = {
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="m3 3 18 18M10.5 10.5a2.1 2.1 0 0 0 3 3M6 6C3.5 8 2 12 2 12s3.5 7 10 7c1.5 0 3-.4 4.3-1M10 5.2c.7-.1 1.3-.2 2-.2 6.5 0 10 7 10 7s-1.1 2.3-3 4.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
} as const;

/** Iconos decorativos locales: no requieren fuentes ni otra biblioteca nativa. */
export function Icon({
  name,
  color,
  size = 20,
}: {
  name: keyof typeof paths;
  color: string;
  size?: number;
}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  return (
    <Image
      accessible={false}
      source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }}
      style={{ width: size, height: size }}
    />
  );
}
