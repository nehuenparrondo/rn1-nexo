# RN1 · Guía completa del ingreso y la administración de cuentas

Revisión del código del 16 de noviembre de 2026.

Frontend actualizado a SDK 58 el 17 de noviembre. Consultar
[los cambios y las comprobaciones de esa actualización](EXPO-SDK-58.md).

RN1, presentado como Nexo, utiliza React Native, Expo SDK 58 y TypeScript en
frontend, y Node.js, Express y MySQL en backend. La ejecución local preparada en
esta computadora conserva los usuarios en rn1_nexo de XAMPP.

## 1. Arquitectura y carpetas

El recorrido general es formulario → cliente HTTP → ruta Express → módulo de
negocio → MySQL → respuesta JSON → estado de sesión → pantalla.

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| frontend/src/app | Rutas de Expo Router y formularios de cada pantalla. |
| frontend/src/pages/WelcomePage.tsx | Bienvenida presentacional que recibe props. |
| frontend/src/components/ui | Campos, botones, mensajes, avatar y estructura visual. |
| frontend/src/providers | Sesión local, sesión social y tema compartidos. |
| frontend/src/services/apiAccess.ts | Peticiones HTTP y tratamiento uniforme de respuestas. |
| frontend/src/services/session-storage | Persistencia del transporte de sesión según plataforma. |
| frontend/src/utils | Validaciones, fotos y presentación del tiempo. |
| backend/server.js | Arranque normal, servicios SQL y comprobación de conexión. |
| backend/app.js | API Express, validaciones y permisos de los endpoints. |
| backend/modules | Consultas SQL, sesiones, códigos, recuperación y correo. |
| backend/database/schema.sql | Tablas y relaciones de una instalación nueva. |
| backend/scripts | Preparación local y tareas administrativas explícitas. |
| backend/demo | Implementación alternativa con cuentas temporales. |
| tests | Comprobaciones automatizadas con servicios aislados. |

backend300926 y frontend - copia son respaldos históricos. El código de ejecución
actual está en backend y frontend. node_modules y dist se generan al instalar o compilar.

## 2. Pantallas y navegación

[Navigation](../frontend/src/app/_layout.tsx#L22) instala el Stack y sus guardas.
SessionProvider consulta la sesión antes de decidir qué pantallas puede mostrar.

| Ruta | Función | Condición |
| --- | --- | --- |
| / | Formulario de ingreso. | Visitante. Una sesión existente redirige. |
| /registro | Crear cuenta. | Sin sesión local ni social. |
| /verificar-email | Confirmar o reenviar el código. | Sesión local con email pendiente. |
| /bienvenida | Mostrar saludo y enlace a la cuenta. | Email local verificado. |
| /cuenta | Nombre, foto y contraseña. | Email local verificado. |
| /recuperar-contrasena | Pedir el enlace de recuperación. | Ruta directa; el enlace fue retirado del ingreso. |
| /restablecer-contrasena | Recibir token y elegir contraseña. | Token válido en la URL o enlace profundo. |
| /admin | Buscar, editar y eliminar usuarios. | Sesión local verificada con rol admin. |
| /cuenta-auth0 | Mostrar una identidad social. | Sesión del proveedor social. |

Las guardas visuales se complementan con requerirSesion, requerirEmailVerificado
y requerirAdmin en Node. Modificar la dirección del navegador no concede permisos.

## 3. Inicio de sesión, paso por paso

[LoginScreen](../frontend/src/app/index.tsx#L17) guarda identifier y password en
estados locales mientras se escribe. El botón Ingresar ejecuta submit dentro de
useTask, que controla espera, error y mensaje.

1. El formulario comprueba que los campos tengan contenido.
2. [login](../frontend/src/services/apiAccess.ts#L172) envía POST /api/login.
3. backend/app.js valida los campos y llama a [login de SQL](../backend/modules/consultas.js#L73).
4. La consulta parametrizada busca username o email en usuarios.
5. bcrypt.compare comprueba la contraseña frente a password_hash.
6. Si falla, la API responde HTTP 401 con un mensaje genérico.
7. Si funciona, crearSesion genera el token y persiste su hash en sesiones_usuario.
8. La API devuelve usuario y verificationExpiresAt. En móvil incluye sessionToken.
9. SessionProvider.accept conserva el perfil público y el vencimiento recibido.
10. La cuenta verificada navega a /bienvenida. La pendiente va a /verificar-email.

Ejemplo conceptual de la respuesta pública de una cuenta verificada.

    {
      "success": true,
      "usuario": {
        "username": "alumno",
        "email": "alumno@example.test",
        "email_verified_at": "fecha-de-verificacion",
        "profile_picture": null,
        "role": "user"
      },
      "verificationExpiresAt": null
    }

usuarioPublico elimina el ID interno, is_admin y los campos de contraseña antes
de construir la respuesta. El ID se añade expresamente en respuestas administrativas.

## 4. Dónde se usan props en la bienvenida

[WelcomeScreen](../frontend/src/app/bienvenida.tsx#L11) obtiene la sesión del
contexto y renderiza WelcomePage con estas props.

| Prop | Dato o acción |
| --- | --- |
| user | Perfil público confirmado por la API. |
| busy | Indica una operación pendiente. |
| error | Mensaje para presentar dentro de la página. |
| onOpenAccount | Navega a /cuenta. |
| onSignOut | Solicita el cierre remoto. |

[WelcomePage](../frontend/src/pages/WelcomePage.tsx#L16) muestra nombre, email y
avatar utilizando esos parámetros. El contexto transporta el perfil entre rutas,
y las props lo entregan explícitamente a la página visual.

## 5. Registro y verificación del correo

registro.tsx mantiene username, email, password y confirm. Las funciones de
utils/password.ts validan el borrador antes de enviar POST /api/personas.
Node repite las validaciones.

| Campo | Regla del backend |
| --- | --- |
| username | De 3 a 100 caracteres, letras ASCII, números o guion bajo. |
| email | Formato de email, hasta 100 caracteres, normalizado a minúsculas. |
| password | Al menos 8 caracteres, letras y números, hasta 72 bytes UTF-8. |
| Confirmación | Se compara en el formulario antes de enviar. |

[crearPersona](../backend/modules/consultas.js#L97) comprueba duplicados,
calcula bcrypt con coste 10 e inserta username, email y password_hash.
email_verified_at empieza vacío. La ruta crea una sesión inicial y solicita un código.

[crearCodigoVerificacion](../backend/modules/verificacionEmail.js#L26)
genera seis dígitos, invalida códigos anteriores y guarda SHA-256 con vencimiento
de un minuto en tokens_autenticacion. correo.js envía el código a Mailtrap Sandbox.

verificar-email.tsx envía codigo a /api/verificacion-email/confirmar.
El servidor exige que esté vigente y sin usar, lo consume y actualiza email_verified_at.
La navegación habilita entonces la bienvenida y la cuenta.
El contador visual utiliza la fecha recibida. Recargar la página no genera un código
nuevo ni extiende el vencimiento de la base.

La cuenta ya existe cuando se realiza el envío del registro. Si falla el correo,
volver a registrar los mismos datos puede producir un duplicado. Ingresar con la
cuenta pendiente permite retomar la verificación y solicitar un código.

## 6. Qué se guarda y en qué lugar

| Dato | Ubicación |
| --- | --- |
| Usuario registrado | Tabla usuarios. |
| Contraseña | Hash bcrypt en usuarios.password_hash. |
| Sesión del servidor | Hash SHA-256 del token en sesiones_usuario. |
| Token en iOS/Android | SecureStore, clave rn1.session. |
| Sesión web | Cookie sesion_id HttpOnly, enviada por el navegador. |
| Perfil que se muestra | Estado de SessionProvider, recuperable desde /api/sesion. |
| Código o recuperación | Hash y metadatos en tokens_autenticacion. |
| Foto | Data URL en usuarios.profile_picture. |
| Tema | AsyncStorage mediante ThemeProvider. |

[session-storage.ts](../frontend/src/services/session-storage.ts) usa SecureStore en
móvil. Expo selecciona [la variante web](../frontend/src/services/session-storage.web.ts)
cuando corresponde. En esa variante no se copia el token a JavaScript.
apiAccess envía credentials include en web y Authorization Bearer en móvil.
sessionTransport interpreta la cabecera nativa y la cookie. Una cabecera Bearer
mal formada no cae silenciosamente a una cookie alternativa.

Las sesiones duran 30 días. obtenerUsuarioPorSesion comprueba formato, hash,
vencimiento y revocación, y registra last_seen_at. Logout revoca la sesión SQL
antes de limpiar el estado del cliente.

## 7. Perfil, fotos y contraseñas

### Nombre y foto

cuenta.tsx separa el borrador de nombre y foto del perfil confirmado.
Guardar nombre llama a updateUsername y actualiza el contexto con la respuesta.
Seleccionar una imagen modifica el borrador. Guardar foto solicita la escritura.
Quitar foto envía null al confirmar.

[pickProfilePicture](../frontend/src/utils/profile-picture.ts#L9)
abre la biblioteca, reduce la dimensión mayor a 800 cuando es necesario,
convierte a JPEG con calidad 0.8 y genera Base64. La API admite una Data URL
de PNG, JPG/JPEG, WEBP o GIF de hasta 2 MB codificados, aproximadamente 1.5 MB de archivo.
El cuerpo JSON admite hasta 3 MB.

### Cambiar la contraseña desde la cuenta

El formulario envía currentPassword y password a PUT /api/cuenta/password.
La API exige sesión verificada, una contraseña nueva distinta y la política vigente.
[actualizarPasswordConActual](../backend/modules/consultas.js#L157)
bloquea la fila SQL con FOR UPDATE, compara bcrypt, calcula el hash nuevo y
revoca las demás sesiones dentro de una transacción. Conserva la sesión actual.
El frontend exige HTTP 204 antes de mostrar el cambio confirmado.

### Recuperar una contraseña olvidada

recuperar-contrasena.tsx solicita POST /api/recuperacion-password con email.
La respuesta es genérica para evitar revelar si existe la cuenta.
[crearEnlaceRecuperacion](../backend/modules/recuperacionPassword.js#L31)
genera 32 bytes aleatorios, guarda SHA-256 con vencimiento de 15 minutos e invalida
enlaces anteriores. PASSWORD_RESET_URL determina la pantalla que abrirá el enlace.

restablecer-contrasena.tsx toma token de los parámetros. Envía token y password a
/api/restablecer-password. La transacción bloquea el registro del token, lo consume,
actualiza bcrypt y revoca todas las sesiones. Si falla una escritura se revierte
la operación. Después se vuelve al ingreso para entrar con la contraseña nueva.

## 8. Administración y baja en la API

La pantalla Mi cuenta conserva edición de nombre, foto, contraseña y cierre de
sesión. La opción de eliminar la cuenta y su diálogo fueron retirados de esta pantalla.
El backend conserva DELETE /api/cuenta: obtiene la identidad de la sesión y el
esquema elimina sus sesiones y tokens mediante ON DELETE CASCADE.

El panel /admin requiere el rol persistido. GET /api/admin/usuarios acepta la
búsqueda q y devuelve hasta 100 coincidencias con sus IDs. PATCH actualiza nombre
y/o foto después de validar el borrador. DELETE elimina la cuenta elegida y
rechaza la eliminación propia desde ese panel.

scripts/createAdmin.js prepara un administrador explícitamente. El registro
público ignora cualquier intento de adjudicarse ese rol.

## 9. Contrato de la API

Las rutas siguientes se definen en backend/app.js. Todas las respuestas contienen
JSON salvo las operaciones HTTP 204, que terminan sin cuerpo.

| Método y ruta | Cuerpo o consulta | Requisito / resultado |
| --- | --- | --- |
| GET /api/health | — | Comprobación HTTP básica. La conexión SQL se comprueba al arrancar server.js. |
| POST /api/personas | username, email, password | Alta y sesión inicial, HTTP 201. |
| POST /api/login | identifier, password | Perfil y sesión, HTTP 200 o 401. |
| GET /api/sesion | — | Sesión válida, devuelve perfil. |
| POST /api/logout | — | Revoca el token recibido, HTTP 204. |
| POST /api/verificacion-email/enviar | — | Sesión pendiente, devuelve expiresAt. |
| POST /api/verificacion-email/confirmar | codigo | Sesión pendiente, devuelve perfil verificado. |
| POST /api/recuperacion-password | email | Respuesta genérica. |
| POST /api/restablecer-password | token, password | Token válido, HTTP 204. |
| PUT /api/cuenta/username | username | Sesión verificada, perfil actualizado. |
| PUT /api/cuenta/foto | profilePicture | Sesión verificada, perfil actualizado. |
| PUT /api/cuenta/password | currentPassword, password | Sesión verificada, HTTP 204. |
| DELETE /api/cuenta | — | Sesión válida, HTTP 204. |
| GET /api/admin/usuarios | q | Sesión verificada y admin. |
| PATCH /api/admin/usuarios/:id | username y/o profilePicture | Admin, devuelve perfil actualizado. |
| DELETE /api/admin/usuarios/:id | — | Admin, prohíbe la eliminación propia desde el panel. |

apiAccess limita la espera a 15 segundos y traduce errores a ApiError.
Los errores habituales son 400 por datos inválidos, 401 por sesión o credenciales,
403 por permisos, 404 por cuenta inexistente, 409 por duplicado y 413 por tamaño.

## 10. Base y configuración

[db.js](../backend/modules/db.js) crea el pool MySQL a partir de DB_HOST, DB_PORT,
DB_USER, DB_PASSWORD y DB_NAME. server.js comprueba SELECT 1 antes de escuchar.
Las consultas utilizan parámetros para los valores recibidos.

| Tabla | Campos y responsabilidad |
| --- | --- |
| usuarios | id, username, email, password_hash, email_verified_at, profile_picture, is_admin. |
| sesiones_usuario | usuario_id, token_hash, expires_at, created_at, last_seen_at, revoked_at, user_agent, ip_address. |
| tokens_autenticacion | usuario_id, tipo, token_hash, expires_at, created_at, used_at. |

La base local actual es rn1_nexo, en MySQL/MariaDB de XAMPP, puerto 3306.
En phpMyAdmin seleccionar rn1_nexo → usuarios → Examinar para mostrar un alta.
En sesiones_usuario puede explicarse la relación entre la cuenta y sus ingresos.

| Archivo o variable | Uso |
| --- | --- |
| backend/.env | Correo privado y configuración general. |
| backend/.env.local | Conexión local y puertos de esta computadora. Tiene prioridad al ejecutar npm start. |
| frontend/.env.local | EXPO_PUBLIC_API_URL con la dirección pública de la API. |
| EXPO_PUBLIC_NATIVE_API_URL | Dirección accesible desde el teléfono, si difiere de la web. |
| FRONTEND_URL | Orígenes permitidos por CORS en el backend. |
| PASSWORD_RESET_URL | Destino web, esquema rn1 o enlace de Expo Go. |
| MAIL_API_KEY, MAIL_INBOX_ID, MAIL_SANDBOX, SENDER | Transporte a Mailtrap. |

Las variables EXPO_PUBLIC llegan al cliente. Las claves SQL y Mailtrap pertenecen
al backend. Los archivos .env reales se excluyen de Git.

## 11. Modo normal, demo y Auth0

npm start en backend ejecuta los módulos SQL. La configuración local usa el puerto
5091 y la web 8092. npm run demo ejecuta servicios en memoria con las mismas rutas
y correo hacia Mailtrap Sandbox. Reiniciar la demo elimina sus cuentas temporales.

La sesión Auth0 es un recorrido separado de la cuenta SQL tradicional. SocialProvider
y cuenta-auth0.tsx administran esa identidad. El código no vincula automáticamente
una sesión Auth0 con un usuario de rn1_nexo.

El login social nativo requiere una development build con el SDK y la aplicación
Auth0 configurados. Expo Go permite probar el acceso local y presenta las
limitaciones del acceso social. Las credenciales y configuración social de R5
no se convierten por sí solas en una aplicación nativa válida.

## 12. Ejecutar y probar por separado

1. Encender MySQL en XAMPP.
2. Instalar con npm ci dentro de backend y frontend.
3. En una instalación local nueva, ejecutar npm run setup:local desde backend.
4. Completar el correo privado a partir de backend/.env.example.
5. Iniciar backend con npm start.
6. Iniciar frontend con npm run local -- --web.
7. Abrir http://127.0.0.1:8092/.

La preparación local crea la base y una cuenta SQL exclusiva con permisos de
datos. Si el administrador de XAMPP tiene credenciales propias, se configuran
DB_ADMIN_USER y DB_ADMIN_PASSWORD para ese comando.

Para el teléfono, configurar una IP actual de la PC accesible desde el iPhone,
el HOST del backend y PASSWORD_RESET_URL para Expo Go. localhost en el teléfono
representa al propio teléfono.

Backend dispone de npm test. Frontend dispone de npm run typecheck, lint,
test:password, test:ui, test:welcome y build:web. Los tests aislados comprueban
contratos, permisos, errores y transacciones. Las fotos, teclado y enlaces
profundos requieren además comprobación en el dispositivo.

## 13. Preguntas para el profesor

| Pregunta | Respuesta y código |
| --- | --- |
| ¿Dónde recibe el frontend el ingreso? | submit en app/index.tsx recoge los estados y llama a apiAccess.login. |
| ¿Dónde se comprueba la contraseña? | consultas.login consulta usuarios y ejecuta bcrypt.compare. |
| ¿Dónde se guarda el usuario? | crearPersona inserta en usuarios de rn1_nexo. |
| ¿Dónde se guarda la sesión? | sesiones_usuario guarda el hash, y el cliente conserva cookie o token según plataforma. |
| ¿Dónde están las props de bienvenida? | app/bienvenida.tsx entrega user y callbacks a pages/WelcomePage.tsx. |
| ¿Qué hace el contexto? | Comparte el perfil y operaciones entre pantallas después de consultar la API. |
| ¿Qué cambia al recuperar una contraseña? | Se escribe bcrypt, se consume el token y se revocan todas las sesiones. |
| ¿Por qué se usa una transacción? | Para confirmar o revertir juntas las escrituras de una operación sensible. |
| ¿Dónde llega el código? | Al Mailtrap Sandbox configurado en backend, compartido en esta PC con otros trabajos. |
| ¿La foto se guarda al elegirla? | Primero es un borrador; Guardar foto solicita la escritura SQL. |

Consultar también [el mapa navegable](MAPA-ARCHIVOS-Y-FUNCIONES.md) y
[el recorrido de la consigna de login](CONSIGNA-LOGIN-MYSQL.md).

## 14. Verificación de la revisión documental del 16 de noviembre

| Comprobación | Resultado |
| --- | --- |
| Frontend: npm run typecheck y npm run lint | Correctos. |
| Frontend: npm run test:password | 11 pruebas aprobadas. |
| Frontend: npm run test:ui | 9 pruebas aprobadas. |
| Frontend: npm run test:welcome | 6 pruebas aprobadas. |
| Backend: npm test | 44 pruebas aprobadas. |

Las 70 pruebas terminaron sin fallos ni omisiones. Cubren contratos de respuesta,
permisos, transporte de sesión, bienvenida por props, validación y transacciones
de contraseña con dependencias aisladas. La comprobación física de fotos y
enlaces en el teléfono corresponde al recorrido manual descrito arriba.

El mapa reúne 78 archivos y enlaza 175 funciones o componentes declarados.
Se actualizaron README.md, esta guía y MAPA-ARCHIVOS-Y-FUNCIONES.md y se ampliaron
comentarios en rutas, consultas, cliente HTTP, sesión y bienvenida.
La comparación del código ejecutable antes y después confirma que esta revisión
conserva la lógica de la aplicación.
