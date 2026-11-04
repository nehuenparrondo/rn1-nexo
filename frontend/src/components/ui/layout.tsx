/**
 * Guía de lectura. Componente reutilizable layout. Sus props conectan contenido y acciones
 * con el componente que lo usa; para seguir el dato, buscar sus importaciones y los
 * callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/theme-provider';
import { cardPadding, metrics, pagePadding, softShadow } from '@/theme';
import { Brand } from '../brand';
import { AuthIntro } from '../auth-intro';
import { Copy } from './typography';

/** Marco compartido: áreas seguras, teclado, scroll y ancho adaptable. */
export function Screen({
  children,
  maxWidth = metrics.authWidth,
}: PropsWithChildren<{ maxWidth?: number }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Math.max(
            pagePadding(width),
            insets.left,
            insets.right,
          ),
          paddingTop: Math.max(28, insets.top + 16),
          paddingBottom: Math.max(88, insets.bottom + 72),
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: Math.max(maxWidth, 1040),
            alignSelf: 'center',
            paddingBottom: 32,
          }}
        >
          <Brand />
        </View>
        <View style={{ flexGrow: 1, justifyContent: 'center', width: '100%' }}>
          <View
            style={{
              width: '100%',
              maxWidth,
              alignSelf: 'center',
              gap: metrics.gap,
            }}
          >
            {children}
          </View>
        </View>
        <View style={{ alignItems: 'center', paddingTop: 28 }}>
          <Copy hint style={{ marginTop: 0 }}>
            Nexo · Un espacio que se adapta a vos.
          </Copy>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <View
      style={[
        {
          padding: cardPadding(width),
          gap: metrics.gap,
          backgroundColor: colors.surface,
          borderRadius: metrics.radius,
          borderWidth: 1,
          borderColor: colors.border,
          boxShadow: softShadow(colors.shadow),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Dos columnas en escritorio; en móvil se prioriza exclusivamente el formulario. */
export function AuthLayout({
  children,
  alternatives,
}: PropsWithChildren<{ alternatives?: ReactNode }>) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  return (
    <Screen maxWidth={wide ? metrics.socialWidth : metrics.authWidth}>
      <View
        style={{
          flexDirection: wide ? 'row' : 'column',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        {wide ? <AuthIntro /> : null}
        <Card
          style={{
            flex: wide ? 1 : undefined,
            minWidth: 0,
            justifyContent: 'center',
            gap: 22,
          }}
        >
          <Copy
            hint
            style={{
              marginTop: 0,
              fontWeight: '600',
              letterSpacing: 1.6,
              fontSize: 10,
            }}
          >
            BIENVENIDO A NEXO
          </Copy>
          {children}
          {alternatives}
        </Card>
      </View>
    </Screen>
  );
}
export function Section({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 24,
        gap: 18,
      }}
    >
      {children}
    </View>
  );
}
export function Columns({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={{
        flexDirection: width > metrics.mobileBreakpoint ? 'row' : 'column',
        gap: 24,
      }}
    >
      {children}
    </View>
  );
}
export function Actions({
  children,
  dialog = false,
}: PropsWithChildren<{ dialog?: boolean }>) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={{
        flexDirection:
          width > metrics.mobileBreakpoint
            ? 'row'
            : dialog
              ? 'column-reverse'
              : 'column',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 8,
      }}
    >
      {children}
    </View>
  );
}
