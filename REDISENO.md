# Nexo · Rediseño de RN1

## Actualización posterior: Mailtrap

Después del rediseño, y a pedido del usuario, se integró Mailtrap Sandbox usando el buzón de R5 con autorización. Se añadió un modo de demostración portable dentro del proyecto y documentación de inicio en [MAILTRAP.md](MAILTRAP.md). Los apartados de revisión visual que siguen describen las pruebas anteriores, cuando el correo todavía se capturaba localmente.

## Alcance

Se trabaja sobre `frontend/`, la aplicación activa de React Native, Expo SDK 57 y TypeScript. `backend/` conserva Node/Express, sus contratos HTTP y su lógica. No se modifican `frontend - copia/`, `backend300926/` ni `dist-style-check/`, que son versiones anteriores.

La aplicación pasa de una estética retro, monoespaciada y de bordes gruesos a un portal de cuentas contemporáneo: azul noche, verde agua, superficies discretas, bordes finos, radios amplios y tipografía del sistema. Se conserva el cambio de tema claro/oscuro y su persistencia.

## Organización del frontend

```text
src/
  app/                         Rutas Expo Router y comportamiento de cada pantalla
  components/
    ui.tsx                     Exportaciones compatibles con las pantallas existentes
    ui/
      layout.tsx               Screen, Card, AuthLayout, Section, Columns y Actions
      typography.tsx           Jerarquía de texto y encabezados
      button.tsx               Acciones, enlaces, bloqueo y estados de interacción
      field.tsx                Inputs controlados y visibilidad de contraseña
      feedback.tsx             Errores, confirmaciones y estado de carga
      avatar.tsx               Foto de perfil e inicial de respaldo
    brand.tsx                  Identidad Nexo reutilizable
    auth-intro.tsx             Panel editorial para escritorio
    icon.tsx                   Iconos SVG locales con expo-image
    theme-button.tsx           Control de tema
    social-buttons.tsx         Presentación de las alternativas configuradas en Auth0
    delete-confirmation.tsx    Confirmación explícita de eliminación
  providers/                   Sesiones, Auth0 y preferencia de tema, sin cambios
  services/                    Acceso HTTP y almacenamiento de sesión, sin cambios
  utils/                       Validaciones y selección de fotos conservadas; formato de duración
  theme.ts                     Paletas semánticas, espaciado, tipografía y medidas
tests/
  password-flow.test.cjs        Regresiones existentes del flujo de contraseñas
  design-system.test.cjs        Contraste, fuentes y tamaños táctiles
```

Los comentarios en español explican responsabilidades y decisiones, sin repetir cada instrucción del código. Los componentes de presentación no importan servicios de API ni administran sesiones.

## Funciones conservadas

- Login, registro y validaciones, incluidas las contraseñas de hasta 72 bytes UTF-8.
- Verificación de correo, vencimiento y reenvío. Solo se corrige la presentación de minutos y segundos.
- Recuperación, restablecimiento, revocación de sesiones y enlaces nativos.
- Perfil: nombre, selección/eliminación de foto y cambio de contraseña.
- Baja propia con confirmación y administración de usuarios con búsqueda, edición y baja.
- Alternativas Google, GitHub y Apple cuando Auth0 está configurado; nunca se simula una autenticación social exitosa.
- Cookies HttpOnly en web y almacenamiento seguro en móvil.

## Diseño adaptable y accesibilidad

- El panel editorial aparece desde 1000 puntos; por debajo se muestra únicamente el formulario.
- Los grupos de controles se apilan en pantallas estrechas. Se mantienen scroll, tratamiento del teclado y áreas seguras.
- Las acciones principales tienen 50 puntos de alto y los controles de tema/contraseña al menos 48 puntos.
- Texto y acciones habilitadas se comprueban con contraste mínimo 4.5:1 en ambas paletas. Las acciones destructivas usan un fondo propio para conservar contraste en el tema oscuro.
- Inputs etiquetados, foco por teclado visible en web, campos de contraseña con acción accesible y mensajes anunciados por lectores de pantalla.
- Las ilustraciones son vistas locales y los iconos usan expo-image ya instalado. No se agregan dependencias de ejecución, fuentes remotas, animaciones ni peticiones decorativas.

## Comprobaciones reproducibles

Desde `frontend/`:

```powershell
npm ci
npm run lint
npm run typecheck
npm run test:password
npm run test:ui
npm run build:all
```

Desde `backend/`:

```powershell
npm ci
npm test
```

Los tests existentes usan almacenamiento simulado y bcrypt real donde corresponde. No modifican bases ni envían correo externo. La exportación de Android/iOS comprueba el empaquetado JavaScript/Hermes, no sustituye una instalación y prueba en un dispositivo.

Para iniciar con los servicios reales, se conservan las instrucciones de `frontend/README.md`: configurar las variables de entorno y arrancar el backend y Expo por separado. No se copiaron credenciales de otros trabajos.

## Revisión del 18/10/2026

- Instalación reproducible completada en frontend y backend.
- TypeScript y ESLint sin errores.
- 29 pruebas de backend, 11 del cliente de contraseñas y nueve del sistema visual correctas.
- Empaquetado web, Android e iOS completado.
- Revisión adicional de los flujos mediante una API local aislada, cuentas sintéticas y correo capturado; sin MySQL ni Mailtrap real.
- 13 comprobaciones de integración aislada, 21 verificaciones en navegador y 24 combinaciones responsive correctas (seis pantallas a 320, 390, 768 y 1280 puntos).
- Se corrigió un desbordamiento visual del formulario administrativo a 320 puntos, sin modificar sus acciones.
- Expo recomienda ocho actualizaciones de parche compatibles. Se conservan las versiones bloqueadas del proyecto para no mezclar una actualización de SDK con el rediseño.

## Límites

No se afirma que estén configurados MySQL, Mailtrap ni Auth0 del usuario. El funcionamiento contra esos servicios depende de sus credenciales y despliegues. Tampoco se ejecutó la app en un teléfono físico: selector de fotos, teclado nativo, enlaces profundos y autenticación social requieren esa comprobación en el dispositivo.

La vista previa de revisión usa cuentas temporales en memoria y un puerto independiente, sin cambiar `.env`, endpoints de producción ni el backend del proyecto. No debe confundirse con una instalación de producción.
