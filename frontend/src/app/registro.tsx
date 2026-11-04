/**
 * Guía de lectura. Pantalla/entrada de Expo Router. Alta: valida el borrador, solicita
 * crear la cuenta y abre el paso de verificación. Las operaciones persistentes se delegan
 * a servicios y no se ejecutan como SQL desde el teléfono.
 */

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Action, AuthLayout, Copy, Feedback, Field } from '@/components/ui';
import { SocialButtons } from '@/components/social-buttons';
import { useTask } from '@/hooks/use-task';
import { useSession } from '@/providers/session-provider';
import { useSocial } from '@/providers/social-provider';
import { register } from '@/services/apiAccess';
import {
  getEmailError,
  getPasswordError,
  getUsernameError,
} from '@/utils/password';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const task = useTask();
  const session = useSession();
  const social = useSocial();
  function submit() {
    void task.run(async () => {
      const error =
        getUsernameError(username) ||
        getEmailError(email) ||
        getPasswordError(password) ||
        (password !== confirm ? 'Las contraseñas no coinciden.' : '');
      if (error) throw new Error(error);
      session.accept(await register(username, email, password));
    });
  }
  return (
    <AuthLayout
      alternatives={
        social.enabled || social.unavailableReason ? (
          <SocialButtons mode="register" busy={task.busy} run={task.run} />
        ) : undefined
      }
    >
      <Copy heading>Creá tu cuenta</Copy>
      <Copy hint>Unos pocos datos. Un espacio propio.</Copy>
      <Field
        label="Usuario"
        placeholder="Elegí un nombre de usuario"
        value={username}
        onChange={setUsername}
        autoComplete="username"
        maxLength={100}
        editable={!task.busy}
      />
      <Field
        label="Email"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        keyboardType="email-address"
        maxLength={100}
        editable={!task.busy}
      />
      <Field
        label="Contraseña"
        value={password}
        onChange={setPassword}
        password
        autoComplete="new-password"
        editable={!task.busy}
      />
      <Copy hint>Mínimo 8 caracteres, con letras y números.</Copy>
      <Field
        label="Confirmar contraseña"
        value={confirm}
        onChange={setConfirm}
        password
        autoComplete="new-password"
        onSubmit={submit}
        editable={!task.busy}
      />
      <Feedback error={task.error} />
      <Action
        label={task.busy ? 'Creando cuenta…' : 'Crear cuenta'}
        onPress={submit}
        disabled={task.busy}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Copy>¿Ya tienes cuenta?</Copy>
        <Action
          label="Inicia sesión"
          onPress={() => router.replace('/')}
          link
          disabled={task.busy}
        />
      </View>
    </AuthLayout>
  );
}
