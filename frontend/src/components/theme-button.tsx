/**
 * Guía de lectura. Parte del sistema visual: comparte colores, tamaños o preferencia de
 * tema según su implementación. La preferencia de apariencia es independiente de la
 * autenticación y de los datos de las tareas.
 */

import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/theme-provider';
import { metrics, softShadow } from '@/theme';
import { Icon } from './icon';

/** Control de tema persistente; respeta el área segura y el foco por teclado. */
export function ThemeButton() {
  const { mode, colors, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cambiar al tema ${mode === 'dark' ? 'claro' : 'oscuro'}`}
      testID="theme-toggle"
      onPress={toggle}
      style={({ pressed }) => ({
        position: 'absolute',
        right: insets.right + 20,
        bottom: insets.bottom + 20,
        zIndex: 10,
        width: metrics.themeSize,
        height: metrics.themeSize,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: softShadow(colors.shadow),
        opacity: pressed ? 0.7 : 1,
        ...(Platform.OS === 'web'
          ? { outlineStyle: 'solid', outlineWidth: 0 }
          : {}),
      })}
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} color={colors.text} />
    </Pressable>
  );
}
