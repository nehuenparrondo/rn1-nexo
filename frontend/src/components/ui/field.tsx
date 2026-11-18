/**
 * Campo controlado de Nexo. Enlaza value y onChange, etiqueta, teclado y opciones de contraseña sin ejecutar el guardado.
 */

import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { fonts, metrics } from '@/theme';
import { Icon } from '../icon';

/** Campo controlado: la pantalla mantiene validación, valor y envío originales. */
export function Field({
  label,
  value,
  onChange,
  password = false,
  onSubmit,
  style,
  onFocus,
  onBlur,
  ...props
}: Omit<
  TextInputProps,
  'value' | 'onChange' | 'onChangeText' | 'onSubmitEditing'
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  password?: boolean;
  onSubmit?: () => void;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInputInstance>(null);
  return (
    <View style={{ gap: 8, minWidth: 0, width: '100%' }}>
      <Text
        style={{
          color: colors.text,
          fontFamily: fonts.regular,
          fontWeight: '600',
          fontSize: 13,
          lineHeight: 20,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: focused ? colors.focus : colors.border,
          borderRadius: metrics.controlRadius,
          backgroundColor: colors.muted,
          opacity: props.editable === false ? 0.6 : 1,
        }}
      >
        <TextInput
          ref={input}
          value={value}
          onChangeText={onChange}
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.secondary}
          secureTextEntry={password && !visible}
          selectionColor={colors.accent}
          returnKeyType={onSubmit ? 'done' : 'next'}
          onSubmitEditing={onSubmit ? () => onSubmit() : undefined}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              minWidth: 0,
              minHeight: metrics.controlHeight,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: metrics.controlRadius,
              backgroundColor: 'transparent',
              color: colors.text,
              fontFamily: fonts.regular,
              fontWeight: '400',
              fontSize: 16,
              lineHeight: 24,
              ...(Platform.OS === 'web'
                ? { outlineStyle: 'solid', outlineWidth: 0 }
                : {}),
            },
            style,
          ]}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            accessibilityState={{ disabled: props.editable === false }}
            disabled={props.editable === false}
            onPress={() => {
              setVisible(!visible);
              input.current?.focus();
            }}
            style={({ pressed }) => ({
              width: 48,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
              borderRadius: 10,
            })}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} color={colors.secondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
