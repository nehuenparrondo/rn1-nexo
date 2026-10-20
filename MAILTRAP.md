# RN1 con Mailtrap Sandbox

## Dónde llega el código

Los mensajes de RN1 llegan a **Mailtrap → Email Sandbox → My Sandbox**. No llegan a Gmail ni al correo real que se escribió al registrarse. En este equipo se usa el mismo buzón autorizado para R5, con ID 4924041:

https://mailtrap.io/sandboxes/4924041/messages

Los asuntos distinguen los proyectos:

- **RN1 · Verifica tu correo**: código de seis dígitos, válido durante un minuto.
- **RN1 · Restablece tu contraseña**: enlace válido durante 15 minutos.
- **RN1 · Conexión Mailtrap**: prueba de conexión; no es un código válido.

Ya no hace falta abrir un outbox local.

## Mostrarlo al profesor con esta computadora y el iPhone

Mantener dos terminales abiertas:

### 1. Backend de demostración

Desde la carpeta `backend`:

```powershell
npm ci
npm run demo
```

La demo usa el servidor y las validaciones HTTP de RN1, correo real hacia Mailtrap Sandbox y cuentas en memoria. No necesita MySQL. **Las cuentas se borran al reiniciar.** No usar este modo en producción.

Cuenta local de demostración: `demo_admin`, contraseña `DemoAcceso123`. Para demostrar el correo, crear una cuenta nueva: la cuenta administrativa ya está verificada y no solicita un código.

### 2. Frontend con Expo Go

Desde la carpeta `frontend`:

```powershell
npm ci
npm run demo
```

Para abrir también la web: `npm run demo -- --web`. Expo utiliza el puerto 8092.

La configuración pública está en `frontend/.env.demo`. Esta PC usa actualmente `192.168.1.6`; si cambia su IP o se usa otra red, actualizar `EXPO_PUBLIC_NATIVE_API_URL` y reiniciar Expo. En un teléfono, `localhost` apunta al teléfono, no a la PC.

Conectar el iPhone al Wi-Fi del mismo router, usar Expo Go compatible con SDK 57 e iniciar sesión con la misma cuenta de Expo que la PC. Escanear el QR actual con la Cámara y permitir el acceso a la red local cuando iOS lo solicite. No desactivar el firewall para corregir un problema de conexión.

### 3. Consultar Mailtrap

Crear una cuenta desde la app, abrir My Sandbox en el navegador, elegir el mensaje con el email utilizado y copiar su código en la app. Usar el mensaje más reciente. Si vence, solicitar uno nuevo.

En el plan actual se detectó un límite de envíos rápidos. Si se solicitan varios mensajes seguidos, esperar antes de volver a intentar; no pulsar repetidamente.

## Configuración privada y entrega en otra computadora

`backend/.env` contiene la clave privada y está ignorado por Git. **No publicar, enviar ni incluir este archivo al entregar el proyecto.** Para que el profesor lo ejecute en otra PC, debe configurar sus propias credenciales a partir de `backend/.env.example`:

- `MAIL_API_KEY`: token con permisos para su buzón.
- `MAIL_SANDBOX=true`.
- `MAIL_INBOX_ID`: ID de su propio buzón.
- `SENDER=sandbox@example.com`.
- `DEMO_PORT=5091`.
- `DEMO_HOST=0.0.0.0` si se accede desde un teléfono en la red privada.
- `PASSWORD_RESET_URL=exp://IP_DE_LA_PC:8092/--/restablecer-contrasena` para el iPhone con Expo Go.

En `frontend`, copiar `.env.demo.example` a `.env.demo` y completar la IP de esa PC. Este archivo solo contiene direcciones públicas de desarrollo; nunca debe contener el token de Mailtrap.

La clave usada en esta PC se reutilizó de R5 con autorización. Cambiarla o revocarla puede afectar a ambos proyectos.

## Prueba de conexión y modo con base real

Desde `backend`:

```powershell
npm run check-mailtrap
npm test
```

`check-mailtrap` envía un diagnóstico al Sandbox. `npm test` usa simulaciones y no realiza envíos reales.

El inicio habitual `npm start` sigue utilizando MySQL y requiere su configuración, esquema y credenciales. Las tablas y la lógica de persistencia no se sustituyen por la demo.

Las instrucciones completas del backend real y Auth0 permanecen en `frontend/README.md`. Para una development build, el enlace de recuperación puede usar `rn1://restablecer-contrasena`; para web, debe apuntar al origen web correspondiente. La configuración actual del enlace está preparada para Expo Go.
