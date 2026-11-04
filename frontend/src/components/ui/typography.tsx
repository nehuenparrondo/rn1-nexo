/**
 * Guía de lectura. Componente reutilizable typography. Sus props conectan contenido y
 * acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y
 * los callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import type { PropsWithChildren } from 'react';
import {
  Text,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { fonts, titleSize } from '@/theme';

/** Jerarquía tipográfica y encabezados accesibles, comunes a todas las vistas. */
export function Copy({
  children,
  title = false,
  heading = false,
  hint = false,
  bold = false,
  style,
}: PropsWithChildren<{
  title?: boolean;
  heading?: boolean | 'small';
  hint?: boolean;
  bold?: boolean;
  style?: StyleProp<TextStyle>;
}>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const size =
    heading === 'small'
      ? 26
      : heading
        ? titleSize(width)
        : title
          ? 18
          : hint
            ? 12
            : 14;
  return (
    <Text
      selectable
      accessibilityRole={title || heading ? 'header' : undefined}
      style={[
        {
          color: hint ? colors.secondary : colors.text,
          fontFamily: fonts.regular,
          fontWeight: title || heading || bold ? '700' : '400',
          fontSize: size,
          lineHeight: Math.round(size * (heading ? 1.2 : 1.55)),
          letterSpacing: heading ? -0.8 : 0,
          flexShrink: 1,
        },
        hint && { marginTop: -8 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
