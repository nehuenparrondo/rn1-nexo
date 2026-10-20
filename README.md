# Consigna 6 · Nexo · Acceso con React Native

Aplicación de usuarios con **React Native, Expo y TypeScript** en `frontend/` y API **Node.js, Express y MySQL** en `backend/`. Las dos partes tienen sus dependencias y responsabilidades separadas.

## Instalar y ejecutar

1. Usar Node.js 24. Dentro de `backend/`, ejecutar `npm ci`.
2. Copiar `backend/.env.example` a `backend/.env` y completar MySQL y Mailtrap con credenciales propias.
3. Crear/seleccionar una base MySQL e importar `backend/database/schema.sql`. El archivo solo define tablas; no incluye cuentas ni datos privados.
4. Ejecutar `npm start` dentro de `backend/`. La API utiliza por defecto el puerto 3005.
5. Dentro de `frontend/`, ejecutar `npm ci`, copiar `.env.example` a `.env` y configurar la URL de la API. En un teléfono físico usar la IP de la computadora en la misma red, no `localhost`.
6. Ejecutar `npm start` y abrir con la versión de Expo Go compatible con el SDK declarado. El acceso social nativo requiere un development build y configuración propia de Auth0; no debe darse por disponible en Expo Go.

## Modo de demostración

`npm run demo` en el backend utiliza cuentas temporales en memoria, no MySQL. En el frontend copiar `.env.demo.example` a `.env.demo`, completar la IP y ejecutar `npm run demo`. Consultar `MAILTRAP.md`. Las credenciales sintéticas del modo demo son públicas y exclusivamente de pruebas; no reutilizarlas en producción. Reiniciar la demo elimina las cuentas temporales.

## Revisar el código

- `frontend/src/app/`: pantallas y navegación.
- `frontend/src/services/`: comunicación con la API y almacenamiento de sesión.
- `backend/modules/`: usuarios, sesiones, correo, códigos y recuperación.
- `backend/database/`: esquema y migraciones.
- `REDISENO.md`, `MAILTRAP.md` y los README internos: decisiones, límites y uso.

## Validar

En backend: `npm test`. En frontend: `npm run typecheck`, `npm run lint`, `npm run test:password`, `npm run test:ui` y `npm run build:web`. No ejecutar scripts de correo o migraciones sobre una base ajena como parte de una comprobación automática.

Esta copia de GitHub contiene el código activo, lockfiles, documentación y licencias originales. No contiene claves, `.env`, bases con datos, dependencias instaladas, compilaciones ni copias históricas.
