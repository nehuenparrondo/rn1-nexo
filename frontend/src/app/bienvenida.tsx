/**
 * Página de Expo Router protegida por la sesión verificada en _layout.tsx.
 * El contexto transporta la respuesta del login entre rutas. La página visual
 * recibe esos datos explícitamente mediante user={session.user}.
 */
import { router } from 'expo-router';
import { WelcomePage } from '@/pages/WelcomePage';
import { useSession } from '@/providers/session-provider';
import { useTask } from '@/hooks/use-task';

export default function WelcomeScreen() {
  const session = useSession();
  const task = useTask();
  if (!session.user) return null;

  return (
    <WelcomePage
      user={session.user}
      busy={task.busy}
      error={task.error}
      onOpenAccount={() => router.push('/cuenta')}
      onSignOut={() => { void task.run(session.signOut); }}
    />
  );
}
