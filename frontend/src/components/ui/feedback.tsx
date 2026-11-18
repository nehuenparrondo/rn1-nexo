/**
 * Mensajes de error, confirmación y carga de Nexo. Presenta estados recibidos por props dentro de la pantalla.
 */

import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { fonts } from '@/theme';
import { Copy } from './typography';

/** Mensajes anunciados por lectores de pantalla sin interrumpir la interacción. */
export function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const { colors } = useTheme();
  if (!error && !message) return null;
  const color = error ? colors.danger : colors.success;
  return (
    <Text
      accessibilityRole={error ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      style={{
        color,
        backgroundColor: color + '14',
        borderWidth: 1,
        borderColor: color + '50',
        borderRadius: 12,
        padding: 14,
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 21,
      }}
    >
      {error || message}
    </Text>
  );
}
export function Loading({ label = 'Cargando…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 32,
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={colors.accent} />
      <Copy>{label}</Copy>
    </View>
  );
}
