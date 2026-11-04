/**
 * Guía de lectura. Selecciona si el acceso social está disponible en este entorno. La
 * sesión externa es independiente de la cuenta SQL tradicional; no asumir que abrir Auth0
 * crea automáticamente un usuario local.
 */

import {
  lazy,
  Suspense,
  use,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { Loading } from '@/components/ui';
import { SocialContext, unavailable } from './social-context';

const Auth0SocialProvider = lazy(() => import('./social-auth0'));
const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN?.trim();
const nativeClientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID?.trim();
const webClientId =
  process.env.EXPO_PUBLIC_AUTH0_WEB_CLIENT_ID?.trim() || nativeClientId;
const subscribe = () => () => {};
const browserSnapshot = () => true;
const serverSnapshot = () => false;
const expoGoUnavailable = {
  ...unavailable,
  unavailableReason:
    'Google, GitHub y Apple requieren una build de desarrollo de RN1. Expo Go no incluye el SDK de Auth0.',
};
export function SocialProvider({ children }: PropsWithChildren) {
  const browserReady = useSyncExternalStore(
    subscribe,
    browserSnapshot,
    serverSnapshot,
  );
  const isWeb = Platform.OS === 'web';
  const clientId = isWeb ? webClientId : nativeClientId;
  if (!domain || !clientId || (isWeb && !browserReady)) {
    return <SocialContext value={unavailable}>{children}</SocialContext>;
  }
  if (
    !isWeb &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    return <SocialContext value={expoGoUnavailable}>{children}</SocialContext>;
  }
  return (
    <Suspense fallback={<Loading label="Preparando autenticación…" />}>
      <Auth0SocialProvider domain={domain} clientId={clientId}>
        {children}
      </Auth0SocialProvider>
    </Suspense>
  );
}
export function useSocial() {
  return use(SocialContext);
}
