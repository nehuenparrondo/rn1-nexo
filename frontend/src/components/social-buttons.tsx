/**
 * Guía de lectura. Componente reutilizable social-buttons. Sus props conectan contenido y
 * acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y
 * los callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import { Text, View } from 'react-native';
import { useSocial } from '@/providers/social-provider';
import { useTheme } from '@/providers/theme-provider';
import { fonts } from '@/theme';
import { Action, Copy, Feedback } from './ui';

export function SocialButtons({
  busy,
  run,
  mode = 'login',
}: {
  busy: boolean;
  run: (task: () => Promise<void>) => Promise<void>;
  mode?: 'login' | 'register';
}) {
  const social = useSocial();
  const { colors, mode: theme } = useTheme();
  if (!social.enabled && !social.unavailableReason) return null;
  const action = mode === 'register' ? 'Registrarte' : 'Continuar';
  const options = [
    {
      label: 'Google',
      connection: 'google-oauth2',
      icon: require('../../assets/social/logoGoogle.png'),
    },
    {
      label: 'GitHub',
      connection: 'github',
      icon:
        theme === 'dark'
          ? require('../../assets/social/logoGitHubBlanco.png')
          : require('../../assets/social/logoGitHubNegro.png'),
    },
    {
      label: 'Apple',
      connection: 'apple',
      icon:
        theme === 'dark'
          ? require('../../assets/social/logoAppleBlanco.png')
          : require('../../assets/social/logoAppleNegro.png'),
    },
  ];
  return (
    <View
      style={{
        gap: 16,
        justifyContent: 'center',
        paddingTop: 22,
        borderTopWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text
          style={{
            color: colors.secondary,
            fontFamily: fonts.bold,
            fontSize: 11,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          O {mode === 'register' ? 'regístrate' : 'continúa'} con
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Feedback error={social.error} />
      {social.unavailableReason ? (
        <Copy hint>{social.unavailableReason}</Copy>
      ) : null}
      <View style={{ gap: 12 }}>
        {options.map(({ label, connection, icon }) => (
          <Action
            key={connection}
            label={`${action} con ${label}`}
            icon={icon}
            secondary
            disabled={busy || social.loading || !social.enabled}
            onPress={() => {
              void run(() => social.signIn(connection));
            }}
          />
        ))}
      </View>
    </View>
  );
}
