/**
 * Guía de lectura. Pantalla/entrada de Expo Router. Verificación: envía el código y
 * controla la espera del reenvío con el vencimiento del servidor. Las operaciones
 * persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.
 */

import { useEffect, useState } from 'react';
import { Action, Card, Copy, Feedback, Field, Screen } from '@/components/ui';
import { useTask } from '@/hooks/use-task';
import { useSession } from '@/providers/session-provider';
import { resendEmailCode, verifyEmailCode } from '@/services/apiAccess';
import { formatRemainingTime } from '@/utils/duration';

export default function VerifyScreen() {
  const session = useSession();
  const task = useTask();
  const [code, setCode] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!session.user) return null;
  const seconds = session.expiresAt
    ? Math.max(0, Math.ceil((Date.parse(session.expiresAt) - now) / 1000))
    : 0;
  function verify() {
    void task.run(async () => {
      if (!/^\d{6}$/.test(code))
        throw new Error('El código debe tener 6 dígitos.');
      session.update(await verifyEmailCode(code));
    });
  }
  function resend() {
    void task.run(async () => {
      session.setExpiresAt((await resendEmailCode()).expiresAt);
      setCode('');
      setNow(Date.now());
    }, 'Enviamos un código nuevo.');
  }
  return (
    <Screen>
      <Card>
        <Copy heading="small">Verifica tu correo</Copy>
        <Copy style={{ marginVertical: 16 }}>
          Enviamos un código de 6 dígitos a{' '}
          <Copy bold>{session.user.email}</Copy>.
        </Copy>
        <Field
          label="Código"
          value={code}
          onChange={(value) => setCode(value.replace(/\D/g, ''))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          maxLength={6}
          onSubmit={verify}
          editable={!task.busy}
        />
        <Copy style={{ marginVertical: 16 }}>
          {seconds > 0
            ? `El código expira en: ${formatRemainingTime(seconds)}`
            : 'Solicita un código nuevo para continuar.'}
        </Copy>
        <Feedback error={task.error} message={task.message} />
        <Action
          label={task.busy ? 'Procesando…' : 'Verificar correo'}
          onPress={verify}
          disabled={task.busy || (!!session.expiresAt && seconds === 0)}
        />
        <Action
          label="Reenviar código"
          link
          onPress={resend}
          disabled={task.busy || seconds > 0}
        />
        <Action
          label="Cerrar sesión"
          link
          onPress={() => {
            void task.run(session.signOut);
          }}
          disabled={task.busy}
        />
      </Card>
    </Screen>
  );
}
