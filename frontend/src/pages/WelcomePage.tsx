/**
 * Bienvenida presentacional. Recibe el perfil público y las acciones por props.
 * La ruta padre obtiene la sesión de la API y decide qué datos entregar aquí.
 */
import { Action, Actions, Avatar, Card, Copy, Feedback, Screen } from '@/components/ui';
import type { User } from '@/types/user';

type WelcomePageProps = {
  user: User;
  busy: boolean;
  error: string;
  onOpenAccount: () => void;
  onSignOut: () => void;
};

export function WelcomePage({
  user,
  busy,
  error,
  onOpenAccount,
  onSignOut,
}: WelcomePageProps) {
  return (
    <Screen>
      <Card style={{ gap: 20 }}>
        <Copy hint>TU ESPACIO PERSONAL</Copy>
        <Avatar name={user.username} picture={user.profile_picture} />
        <Copy heading>¡Bienvenido, {user.username}!</Copy>
        <Copy>Ingresaste correctamente a tu espacio Nexo.</Copy>
        <Copy><Copy bold>Email</Copy> {user.email}</Copy>
        <Feedback error={error} />
        <Actions>
          <Action label="Ir a mi cuenta" onPress={onOpenAccount} disabled={busy} />
          <Action
            label={busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
            onPress={onSignOut}
            secondary
            disabled={busy}
          />
        </Actions>
      </Card>
    </Screen>
  );
}
