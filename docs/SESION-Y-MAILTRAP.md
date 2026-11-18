# Conservar la sesión al consultar Mailtrap

Corrección del 17 de noviembre de 2026.

## Causa reproducida

Expo abre la web como http://localhost:8092, mientras que la configuración de la
API apuntaba a http://127.0.0.1:5091/api. Aunque llegan a la misma computadora,
son sitios distintos para las cookies del navegador. El ingreso podía devolver
un perfil y mostrar una pantalla autenticada sin conservar una cookie utilizable
en la consulta siguiente. Al volver a comprobar la sesión se regresaba al login.

## Corrección

`frontend/src/services/apiAccess.ts`, función apiUrl, conserva el nombre de host
de la página cuando tanto la página como la API usan direcciones de loopback.
Desde localhost consulta localhost:5091, y desde 127.0.0.1 consulta 127.0.0.1:5091.
Se mantienen el puerto, la ruta y las restricciones HttpOnly y SameSite de la cookie.

Las direcciones públicas configuradas se conservan. El iPhone sigue usando
EXPO_PUBLIC_NATIVE_API_URL y su token de SecureStore; esta normalización corresponde
al navegador.

En app.json se desactivó la carga asíncrona de rutas solo para web, mediante
asyncRoutes.web = false. Es la opción de compatibilidad documentada para SDK 58;
evita el error de módulos que apareció al recargar durante la comprobación.
Las rutas, sus permisos y la navegación nativa conservan sus funciones.

## Pruebas automatizadas

Se añadieron cuatro casos a tests/password-flow.test.cjs: ambos nombres locales,
una API pública que debe conservarse y la dirección nativa independiente del iPhone.
La suite del frontend pasó sus 30 pruebas. TypeScript y ESLint finalizaron correctamente.

La prueba de navegador creó una cuenta de ensayo sin verificar, abrió el formulario
del código, cambió a una pestaña de Mailtrap y volvió: permaneció en verificar-email.
La cuenta temporal se retiró al terminar. La exportación web con la configuración
final también terminó correctamente.

La caducidad del código y la sesión son independientes: un código vencido requiere
reenvío, mientras la sesión válida permite permanecer en la pantalla de verificación.
