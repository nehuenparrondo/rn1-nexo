/**
 * Guía de lectura. Componente reutilizable button. Sus props conectan contenido y acciones
 * con el componente que lo usa; para seguir el dato, buscar sus importaciones y los
 * callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import { useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { useTheme } from '@/providers/theme-provider';
import { fonts, metrics } from '@/theme';

/** Botones y enlaces con los mismos estados de interacción, foco y bloqueo. */
export function Action({
  label,
  onPress,
  disabled,
  secondary = false,
  danger = false,
  link = false,
  icon,
  compact = false,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  danger?: boolean;
  link?: boolean;
  icon?: ImageSource;
  compact?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole={link ? 'link' : 'button'}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        {
          minHeight: link ? 40 : metrics.controlHeight,
          paddingVertical: link ? 6 : 13,
          paddingHorizontal: link ? 0 : compact ? 18 : 20,
          borderWidth: link ? 0 : 1,
          borderRadius: metrics.controlRadius,
          borderColor: secondary ? colors.border : 'transparent',
          backgroundColor: link
            ? 'transparent'
            : danger
              ? colors.dangerFill
              : secondary
                ? hovered
                  ? colors.muted
                  : colors.surface
                : hovered
                  ? colors.accentHover
                  : colors.accent,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          justifyContent: link ? 'flex-start' : 'center',
          ...(Platform.OS === 'web'
            ? {
                cursor: disabled ? 'auto' : 'pointer',
                outlineStyle: 'solid',
                outlineWidth: 0,
              }
            : {}),
        },
        style,
      ]}
    >
      {icon ? (
        <Image
          source={icon}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
          accessible={false}
        />
      ) : null}
      <Text
        style={{
          fontFamily: fonts.bold,
          fontWeight: '600',
          fontSize: link ? 13 : 14,
          lineHeight: 21,
          textAlign: link ? 'left' : 'center',
          flexShrink: 1,
          textDecorationLine: link && hovered ? 'underline' : 'none',
          color: link
            ? colors.accent
            : danger
              ? '#ffffff'
              : secondary
                ? colors.text
                : colors.onAccent,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
