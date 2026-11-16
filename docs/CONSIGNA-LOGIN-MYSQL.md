# Ingreso, bienvenida y MySQL

RN1 tiene frontend React Native con Expo/TypeScript y backend Node.js/Express. Esta
entrega usa la base local rn1_nexo, en MySQL/MariaDB de XAMPP, puerto 3306.

## Los tres puntos de la consigna

1. La ruta principal, frontend/src/app/index.tsx, muestra el formulario. Al pulsar
   Ingresar, login de services/apiAccess.ts envía POST /api/login. Una respuesta
   correcta actualiza SessionProvider y navega a /bienvenida. Las cuentas nuevas
   completan primero la verificación por correo, que ya formaba parte del trabajo.
2. frontend/src/app/bienvenida.tsx obtiene el perfil confirmado y renderiza
   WelcomePage con user={session.user}. frontend/src/pages/WelcomePage.tsx recibe
   user, busy, error y los callbacks por props y muestra nombre, email y avatar.
   El contexto conserva el perfil entre rutas, y las props lo entregan al componente
   de bienvenida. La contraseña queda fuera de esos datos y de la URL.
3. backend/app.js define POST /api/login. backend/modules/consultas.js busca el
   usuario o email mediante parámetros SQL y compara bcrypt. modules/db.js crea
   el pool MySQL con la configuración privada. La API responde JSON y crea la sesión.
   Un ingreso incorrecto recibe HTTP 401 y un mensaje dentro del formulario.

## Qué JSON devuelve

Ingreso correcto, HTTP 200, ejemplo de perfil público

```json
{
  "success": true,
  "usuario": {
    "username": "alumno_rn1",
    "email": "alumno.rn1@example.test",
    "email_verified_at": "2026-11-16T12:00:00.000Z",
    "profile_picture": null,
    "role": "user"
  },
  "verificationExpiresAt": null
}
```

Ingreso incorrecto, HTTP 401

```json
{"success": false, "message": "Usuario o contraseña incorrectos"}
```

En web la sesión viaja en una cookie HttpOnly. En móvil, la API también entrega un
token opaco que el frontend guarda en SecureStore. SQL conserva el hash del token.

## Abrir en esta computadora

Encender MySQL en XAMPP. En backend ejecutar npm start. En frontend ejecutar
npm run local -- --web. Abrir http://127.0.0.1:8092/.

backend/.env.local contiene la conexión local y tiene prioridad sobre .env al iniciar.
frontend/.env.local tiene la dirección pública de la API, http://127.0.0.1:5091/api.
Los dos archivos se excluyen de Git. El servidor comprueba SQL antes de iniciar.

Para preparar una instalación local nueva con XAMPP, instalar las dependencias con
npm ci en backend y frontend. Desde backend ejecutar npm run setup:local y configurar
el correo privado a partir de .env.example. La preparación crea la base y una cuenta
SQL exclusiva con permisos de datos y admite reintentos con la misma configuración.
Si el administrador local requiere contraseña, pasar DB_ADMIN_USER y
DB_ADMIN_PASSWORD como variables de entorno al ejecutar la preparación.

Para un teléfono, configurar EXPO_PUBLIC_NATIVE_API_URL con la IP actual de la PC,
ajustar HOST en backend/.env.local y el enlace de recuperación para Expo Go.

## Mostrar las tablas al profesor

Abrir phpMyAdmin de XAMPP en http://localhost/phpmyadmin/. Seleccionar rn1_nexo y
usuarios, después Examinar. El alta se guarda en usuarios, las sesiones en
sesiones_usuario y la verificación/recuperación en tokens_autenticacion.
Las contraseñas se almacenan como hashes bcrypt en password_hash.
El esquema reproducible está en backend/database/schema.sql.

## Comprobar

Frontend permite npm run typecheck, npm run lint, npm run test:welcome y
npm run build:web. Backend permite npm test.
Probar ingreso incorrecto, ingreso correcto, bienvenida con nombre/email,
Ir a mi cuenta, Volver a bienvenida, recarga y Cerrar sesión.

El modo separado npm run demo usa datos temporales. Para demostrar esta consigna
con persistencia se ejecuta el backend normal con npm start.

## Comprobación de esta entrega

Se aprobaron las 44 pruebas existentes del backend y las 6 pruebas nuevas del
frontend para props, callbacks, ingreso correcto/incorrecto y verificación pendiente.
También se aprobaron TypeScript, lint y la exportación web con la ruta /bienvenida.

Contra la base local se comprobó el registro HTTP, el hash bcrypt, el JSON del login,
la cookie HttpOnly, las sesiones SQL, el ingreso por email y el cierre de sesión.
Mailtrap aceptó el mensaje del registro de prueba. Para verificar esa cuenta durante
la prueba se generó un segundo código internamente y se confirmó por el endpoint HTTP.
La lectura del código desde la interfaz de Mailtrap se puede demostrar por separado.

En el navegador se comprobó contraseña incorrecta, ingreso a bienvenida, navegación
al perfil, regreso, logout y restauración de la sesión después de reiniciar la API.
Se dejó una cuenta de prueba regular, alumno_rn1, con contraseña DemoAcceso123.
Las cuentas de la ejecución anterior en memoria pertenecen al modo demo separado.
