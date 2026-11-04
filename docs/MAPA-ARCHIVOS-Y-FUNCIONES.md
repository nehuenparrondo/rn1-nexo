# RN1 · Mapa del código activo

[Empezar por la explicación sencilla](LEER-EL-CODIGO.md). Este índice ayuda a ubicar piezas; no hace falta leerlo de principio a fin. Las líneas corresponden a esta revisión y pueden desplazarse si se edita el archivo.

## backend

### [backend/app.js](../backend/app.js)

Módulo auxiliar del proyecto. Las importaciones y símbolos siguientes permiten seguir su relación con el resto del código.

**Se conecta con:** [backend/modules/sessionTransport.js](../backend/modules/sessionTransport.js).

**Funciones para buscar:**

- [`createApp` · línea 12](../backend/app.js#L12): Recibe servicios de usuarios, sesiones y correo y construye la misma API para ejecución normal, pruebas o demo. Inyectar servicios en memoria no convierte esos datos temporales en persistencia MySQL.
- [`validarCampos` · línea 84](../backend/app.js#L84): Construye un middleware que exige textos no vacíos antes de entrar en el manejador. Devuelve 400 para entradas inválidas; next permite continuar a la siguiente comprobación.
- [`validarPasswordSegura` · línea 107](../backend/app.js#L107): Aplica la política de contraseña en el servidor. La validación visual mejora la experiencia, pero no reemplaza esta comprobación para solicitudes hechas fuera del formulario.
- [`validarUsername` · línea 138](../backend/app.js#L138): Valida y normaliza el nombre de usuario antes de consultar SQL. Este campo es un identificador de acceso, no el nombre de una persona del ejercicio de saludo.
- [`validarEmail` · línea 155](../backend/app.js#L155): Comprueba el formato y normaliza el email recibido. Esto no demuestra propiedad del buzón: esa parte corresponde al código de verificación.
- [`usuarioPublico` · línea 178](../backend/app.js#L178): Construye la respuesta de perfil sin contraseña ni hash. El navegador recibe solo los datos necesarios para mostrar la cuenta y su rol.
- [`usuarioAdmin` · línea 188](../backend/app.js#L188): Añade el ID interno a los campos públicos para permitir las operaciones del panel. No convierte por sí mismo al solicitante en administrador.
- [`requerirSesion` · línea 197](../backend/app.js#L197): Resuelve la credencial de sesión y carga el usuario en req.usuario. Si no hay sesión válida responde 401 y no deja llegar al código que modifica datos.
- [`requerirEmailVerificado` · línea 211](../backend/app.js#L211): Bloquea con 403 las operaciones que exigen email confirmado. Una sesión abierta no implica que el correo ya esté verificado.
- [`requerirAdmin` · línea 224](../backend/app.js#L224): Exige el rol administrativo además de la sesión. Ocultar el botón del panel en el frontend no sustituye este permiso del backend.
- [`errorFotoPerfil` · línea 233](../backend/app.js#L233)
- [`validarFotoPerfil` · línea 247](../backend/app.js#L247)
- [`enviarNuevoCodigo` · línea 257](../backend/app.js#L257): Coordina generación del código y envío del correo; devuelve el vencimiento que debe mostrar el contador de la pantalla.

### [backend/demo/server.js](../backend/demo/server.js)

Arranque de demostración: inyecta cuentas/sesiones temporales, conserva el envío real a Mailtrap Sandbox y rechaza producción. Reiniciar este proceso borra sus cuentas, aunque el frontend sea el mismo.

**Se conecta con:** [backend/app.js](../backend/app.js), [backend/modules/correo.js](../backend/modules/correo.js), [backend/demo/services.js](../backend/demo/services.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/demo/services.js](../backend/demo/services.js)

Implementación en memoria del contrato de usuarios, sesiones y códigos para la demo. No ejecuta SQL ni conserva cuentas después de reiniciar; permite probar pantallas sin confundirlo con el backend normal.

**Funciones para buscar:**

- [`createDemoServices` · línea 11](../backend/demo/services.js#L11)
- [`byId` · línea 17](../backend/demo/services.js#L17)
- [`matches` · línea 18](../backend/demo/services.js#L18)
- [`revoke` · línea 20](../backend/demo/services.js#L20)

### [backend/modules/consultas.js](../backend/modules/consultas.js)

Acceso a la tabla usuarios y comprobación de hashes bcrypt. Estas funciones se ejecutan en Node.js; las rutas aplican permisos y el frontend recibe solo las respuestas públicas.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js), [backend/modules/transaction.js](../backend/modules/transaction.js), [backend/modules/sesiones.js](../backend/modules/sesiones.js).

**Funciones para buscar:**

- [`obtenerPersonasParaAdmin` · línea 20](../backend/modules/consultas.js#L20): Recibe un término de búsqueda y devuelve los campos de perfil que necesita el panel. El permiso de administrador se comprueba en la ruta antes de llamar a esta consulta.
- [`obtenerPersonaPorId` · línea 36](../backend/modules/consultas.js#L36): Consulta una cuenta por su identificador interno. Devuelve los campos seleccionados de la primera coincidencia, o undefined si no existe.
- [`obtenerPersonaPorEmail` · línea 48](../backend/modules/consultas.js#L48): Consulta el email mediante un parámetro SQL. El resultado permite localizar la cuenta para registro, verificación o recuperación; no envía ningún correo por sí mismo.
- [`obtenerPersonaPorUsername` · línea 60](../backend/modules/consultas.js#L60): Busca el nombre de usuario para comprobar disponibilidad. El valor se pasa como parámetro SQL, no concatenado como una instrucción.
- [`login` · línea 73](../backend/modules/consultas.js#L73): Busca una cuenta por usuario o email y compara la contraseña ingresada con su hash bcrypt. Devuelve success y los datos públicos, o un mensaje de credenciales incorrectas. La cookie se crea después, en la ruta HTTP.
- [`crearPersona` · línea 97](../backend/modules/consultas.js#L97): Recibe los datos del formulario, rechaza email o usuario ocupados, calcula un hash bcrypt e inserta la cuenta. Devuelve el ID nuevo o un resultado de conflicto. No guarda la contraseña como texto legible.
- [`actualizarUsername` · línea 125](../backend/modules/consultas.js#L125): Actualiza el nombre de la cuenta cuyo ID recibió. La ruta valida formato, disponibilidad y autorización; esta función realiza la escritura SQL.
- [`actualizarPassword` · línea 140](../backend/modules/consultas.js#L140): Calcula un hash nuevo antes de escribir password_hash. No intenta descifrar la contraseña anterior; la recuperación autoriza el cambio mediante un token.
- [`actualizarPasswordConActual` · línea 157](../backend/modules/consultas.js#L157): Comprueba con bcrypt la contraseña actual antes de aceptar la nueva. No alcanza con cambiar el texto visible del formulario para modificar la cuenta.
- [`actualizarFotoPerfil` · línea 191](../backend/modules/consultas.js#L191): Guarda la representación de la foto, o null para quitarla. La ruta y el selector controlan formatos y tamaño; el archivo de imagen no se sube a GitHub como parte del perfil.
- [`convertirEnAdmin` · línea 203](../backend/modules/consultas.js#L203): Modifica el rol persistido de una cuenta. Es una operación de preparación administrativa, no un permiso que el navegador pueda concederse a sí mismo.
- [`eliminarPersona` · línea 215](../backend/modules/consultas.js#L215): Elimina la cuenta indicada en usuarios. El alcance sobre sesiones y tokens depende de las relaciones SQL; la ruta decide si se permite borrar esa cuenta.

### [backend/modules/correo.js](../backend/modules/correo.js)

Transporte de Mailtrap del backend de RN1. Lee configuración privada y distingue el buzón Sandbox mediante sus opciones; crear el mensaje no cambia la cuenta ni valida el código.

**Funciones para buscar:**

- [`transporteCorreo` · línea 10](../backend/modules/correo.js#L10)
- [`enviarCodigoVerificacion` · línea 47](../backend/modules/correo.js#L47): Recibe email, usuario y código ya generados y compone el mensaje. En Sandbox el destinatario aparece en el mensaje, pero la entrega se captura en Mailtrap, no en su Gmail.
- [`enviarEnlaceRecuperacion` · línea 64](../backend/modules/correo.js#L64): Compone el mensaje de recuperación con el enlace temporal. Enviarlo no cambia la contraseña: el cambio ocurre al validar el token y enviar la nueva clave.
- [`enviarPruebaCorreo` · línea 76](../backend/modules/correo.js#L76)

### [backend/modules/db.js](../backend/modules/db.js)

Pool MySQL del backend normal: lee DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME del entorno privado. Importar servicios SQL no debe confundirse con ejecutar la demo en memoria.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/modules/recuperacionPassword.js](../backend/modules/recuperacionPassword.js)

Recuperación por enlace de un solo uso. Distingue el token que autoriza el cambio del hash de la nueva contraseña que finalmente se guarda.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js), [backend/modules/consultas.js](../backend/modules/consultas.js), [backend/modules/sesiones.js](../backend/modules/sesiones.js), [backend/modules/transaction.js](../backend/modules/transaction.js).

**Funciones para buscar:**

- [`crearToken` · línea 17](../backend/modules/recuperacionPassword.js#L17)
- [`hashearToken` · línea 21](../backend/modules/recuperacionPassword.js#L21)
- [`crearEnlaceRecuperacion` · línea 31](../backend/modules/recuperacionPassword.js#L31): Genera un token nuevo, invalida enlaces anteriores y guarda un hash con vencimiento de 15 minutos. Devuelve el enlace con el token original; el módulo de correo se encarga de enviarlo.
- [`restablecerPasswordConToken` · línea 57](../backend/modules/recuperacionPassword.js#L57): Comprueba que el token corresponda a una recuperación vigente y sin usar. Si lo acepta, consume el token, actualiza el hash de contraseña y revoca las sesiones anteriores. No devuelve la contraseña vieja.

### [backend/modules/sesiones.js](../backend/modules/sesiones.js)

Sesiones propias del sistema: relaciona un token aleatorio con una cuenta y un vencimiento. La base conserva el hash del token, mientras el cliente transporta el valor original.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js).

**Funciones para buscar:**

- [`crearToken` · línea 14](../backend/modules/sesiones.js#L14)
- [`hashearToken` · línea 19](../backend/modules/sesiones.js#L19)
- [`crearSesion` · línea 29](../backend/modules/sesiones.js#L29): Genera un token aleatorio, guarda solo su hash asociado al ID del usuario y devuelve el token original para el transporte al cliente. Crear sesión no crea otra cuenta.
- [`obtenerUsuarioPorSesion` · línea 53](../backend/modules/sesiones.js#L53): Valida la forma del token, busca su hash en una sesión vigente y no revocada, y devuelve el usuario asociado. También actualiza la fecha de último uso.
- [`revocarSesion` · línea 82](../backend/modules/sesiones.js#L82): Marca la sesión como revocada para que el servidor deje de aceptarla. Borrar solo el usuario del estado de React no reemplaza esta operación.
- [`revocarSesionesDeUsuario` · línea 96](../backend/modules/sesiones.js#L96): Invalida todas las sesiones de la cuenta después de una operación sensible, por ejemplo un restablecimiento de contraseña.
- [`revocarOtrasSesionesDeUsuario` · línea 111](../backend/modules/sesiones.js#L111): Invalida las sesiones de otros dispositivos, conservando la que está realizando el cambio de contraseña.
- [`leerCookie` · línea 132](../backend/modules/sesiones.js#L132): Interpreta la cabecera Cookie para encontrar un nombre concreto. Leer el texto no demuestra que la sesión sea válida: esa comprobación requiere consultar la sesión.
- [`opcionesCookieSesion` · línea 153](../backend/modules/sesiones.js#L153): Configura la duración y las restricciones de la cookie. HttpOnly impide leerla desde el JavaScript de la página; Secure se exige cuando el entorno es producción.

### [backend/modules/sesionesCookie.js](../backend/modules/sesionesCookie.js)

Módulo auxiliar del proyecto. Las importaciones y símbolos siguientes permiten seguir su relación con el resto del código.

**Funciones para buscar:**

- [`leerCookie` · línea 7](../backend/modules/sesionesCookie.js#L7): Interpreta la cabecera Cookie para encontrar un nombre concreto. Leer el texto no demuestra que la sesión sea válida: esa comprobación requiere consultar la sesión.

### [backend/modules/sessionTransport.js](../backend/modules/sessionTransport.js)

Adapta el transporte de sesión: navegador con cookie, teléfono con Authorization: Bearer. Una cabecera explícita pero mal formada no debe rescatarse usando otra cookie.

**Se conecta con:** [backend/modules/sesionesCookie.js](../backend/modules/sesionesCookie.js).

**Funciones para buscar:**

- [`obtenerTokenSesion` · línea 15](../backend/modules/sessionTransport.js#L15): Prioriza una cabecera Authorization explícita y exige formato Bearer válido. Solo cuando esa cabecera no existe intenta la cookie; esto evita mezclar identidades por un encabezado inválido.
- [`esClienteNativo` · línea 27](../backend/modules/sessionTransport.js#L27): Lee la marca de plataforma para escoger el transporte de la respuesta. Esta marca no demuestra identidad ni permisos: la sesión debe validarse aparte.

### [backend/modules/transaction.js](../backend/modules/transaction.js)

Agrupa varias escrituras en una misma transacción y conexión: se confirman juntas o se revierten si falla alguna. La conexión se libera también en caso de error.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js).

**Funciones para buscar:**

- [`inTransaction` · línea 15](../backend/modules/transaction.js#L15): Pide una conexión al pool, inicia la transacción y ejecuta work usando esa conexión. Confirma si termina bien, revierte si lanza error y siempre libera la conexión.

### [backend/modules/verificacionEmail.js](../backend/modules/verificacionEmail.js)

Confirmación de propiedad del correo mediante un código temporal. Usa tokens_autenticacion y actualiza email_verified_at; no cambia la contraseña del usuario.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js).

**Funciones para buscar:**

- [`crearCodigo` · línea 12](../backend/modules/verificacionEmail.js#L12)
- [`hashearCodigo` · línea 16](../backend/modules/verificacionEmail.js#L16)
- [`crearCodigoVerificacion` · línea 26](../backend/modules/verificacionEmail.js#L26): Genera el código de confirmación de email y registra su hash y vencimiento. El código legible se entrega al módulo de correo, no se guarda como contraseña de la cuenta.
- [`verificarCodigoVerificacion` · línea 54](../backend/modules/verificacionEmail.js#L54): Compara el código ingresado con el registro vigente. Si coincide, lo marca como usado y registra la fecha de verificación del email.

### [backend/scripts/checkMailtrap.js](../backend/scripts/checkMailtrap.js)

Script de preparación, diagnóstico o mantenimiento. No es una pantalla ni se ejecuta por importarlo desde el navegador; revisar el comando y su destino antes de usarlo porque algunos scripts modifican datos.

**Se conecta con:** [backend/modules/correo.js](../backend/modules/correo.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/scripts/createAdmin.js](../backend/scripts/createAdmin.js)

Script de preparación, diagnóstico o mantenimiento. No es una pantalla ni se ejecuta por importarlo desde el navegador; revisar el comando y su destino antes de usarlo porque algunos scripts modifican datos.

**Se conecta con:** [backend/modules/consultas.js](../backend/modules/consultas.js), [backend/modules/db.js](../backend/modules/db.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/scripts/migrateProfile.js](../backend/scripts/migrateProfile.js)

Script de preparación, diagnóstico o mantenimiento. No es una pantalla ni se ejecuta por importarlo desde el navegador; revisar el comando y su destino antes de usarlo porque algunos scripts modifican datos.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/server.js](../backend/server.js)

Arranque normal de RN1: reúne los servicios SQL y de correo, construye createApp y abre el puerto configurado. A diferencia de demo/server.js, este modo requiere MySQL.

**Se conecta con:** [backend/app.js](../backend/app.js), [backend/modules/consultas.js](../backend/modules/consultas.js), [backend/modules/sesiones.js](../backend/modules/sesiones.js), [backend/modules/correo.js](../backend/modules/correo.js), [backend/modules/verificacionEmail.js](../backend/modules/verificacionEmail.js), [backend/modules/recuperacionPassword.js](../backend/modules/recuperacionPassword.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/tests/api.test.js](../backend/tests/api.test.js)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Se conecta con:** [backend/app.js](../backend/app.js), [backend/modules/sesionesCookie.js](../backend/modules/sesionesCookie.js).

**Funciones para buscar:**

- [`services` · línea 16](../backend/tests/api.test.js#L16)
- [`withApi` · línea 49](../backend/tests/api.test.js#L49)
- [`request` · línea 53](../backend/tests/api.test.js#L53)
- [`json` · línea 63](../backend/tests/api.test.js#L63)

### [backend/tests/demo.test.js](../backend/tests/demo.test.js)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Se conecta con:** [backend/demo/services.js](../backend/demo/services.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/tests/fixtures/mailtrap-client.js](../backend/tests/fixtures/mailtrap-client.js)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/tests/mailtrap.test.js](../backend/tests/mailtrap.test.js)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Se conecta con:** [backend/tests/fixtures/mailtrap-client.js](../backend/tests/fixtures/mailtrap-client.js).

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [backend/tests/password-persistence.test.js](../backend/tests/password-persistence.test.js)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Se conecta con:** [backend/modules/db.js](../backend/modules/db.js), [backend/modules/consultas.js](../backend/modules/consultas.js), [backend/modules/recuperacionPassword.js](../backend/modules/recuperacionPassword.js), [backend/app.js](../backend/app.js).

**Funciones para buscar:**

- [`hashToken` · línea 12](../backend/tests/password-persistence.test.js#L12)
- [`database` · línea 19](../backend/tests/password-persistence.test.js#L19)
- [`assertLoginChanged` · línea 122](../backend/tests/password-persistence.test.js#L122)
- [`withPasswordApi` · línea 127](../backend/tests/password-persistence.test.js#L127)
- [`request` · línea 147](../backend/tests/password-persistence.test.js#L147)

## frontend

### [frontend/app.config.js](../frontend/app.config.js)

Configuración pública de Expo y de sus plugins según el entorno. No introducir claves privadas en valores que se incorporan a la aplicación.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [frontend/eslint.config.js](../frontend/eslint.config.js)

Configuración del análisis estático de código. Define reglas y archivos revisados; no decide permisos de usuarios ni persistencia.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [frontend/src/app/+html.tsx](../frontend/src/app/+html.tsx)

Pantalla/entrada de Expo Router. Documento HTML de la exportación web; no es una pantalla del teléfono. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`Root` · línea 20](../frontend/src/app/+html.tsx#L20)

### [frontend/src/app/+native-intent.tsx](../frontend/src/app/+native-intent.tsx)

Pantalla/entrada de Expo Router. Normaliza el enlace que abre la aplicación nativa para enviarlo a la ruta correcta. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Funciones para buscar:**

- [`redirectSystemPath` · línea 9](../frontend/src/app/+native-intent.tsx#L9)

### [frontend/src/app/admin.tsx](../frontend/src/app/admin.tsx)

Pantalla/entrada de Expo Router. Administración: lista y modifica otras cuentas mediante endpoints protegidos. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/delete-confirmation.tsx](../frontend/src/components/delete-confirmation.tsx), [frontend/src/components/brand.tsx](../frontend/src/components/brand.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/types/user.ts](../frontend/src/types/user.ts), [frontend/src/utils/password.ts](../frontend/src/utils/password.ts), [frontend/src/utils/profile-picture.ts](../frontend/src/utils/profile-picture.ts).

**Funciones para buscar:**

- [`AdminScreen` · línea 36](../frontend/src/app/admin.tsx#L36)
- [`load` · línea 49](../frontend/src/app/admin.tsx#L49)
- [`save` · línea 89](../frontend/src/app/admin.tsx#L89)
- [`AdminRow` · línea 260](../frontend/src/app/admin.tsx#L260)
- [`setPicture` · línea 283](../frontend/src/app/admin.tsx#L283)
- [`save` · línea 288](../frontend/src/app/admin.tsx#L288)

### [frontend/src/app/cuenta-auth0.tsx](../frontend/src/app/cuenta-auth0.tsx)

Pantalla/entrada de Expo Router. Perfil social externo: muestra la identidad de Auth0, separada de la sesión SQL propia. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx).

**Funciones para buscar:**

- [`SocialAccountScreen` · línea 11](../frontend/src/app/cuenta-auth0.tsx#L11)

### [frontend/src/app/cuenta.tsx](../frontend/src/app/cuenta.tsx)

Pantalla/entrada de Expo Router. Perfil: separa borradores de nombre/foto de los datos confirmados y controla cambio de contraseña y baja. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/delete-confirmation.tsx](../frontend/src/components/delete-confirmation.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/utils/password.ts](../frontend/src/utils/password.ts), [frontend/src/utils/profile-picture.ts](../frontend/src/utils/profile-picture.ts).

**Funciones para buscar:**

- [`AccountScreen` · línea 36](../frontend/src/app/cuenta.tsx#L36)
- [`setPicture` · línea 52](../frontend/src/app/cuenta.tsx#L52)
- [`saveName` · línea 66](../frontend/src/app/cuenta.tsx#L66)
- [`selectPhoto` · línea 74](../frontend/src/app/cuenta.tsx#L74)
- [`savePhoto` · línea 80](../frontend/src/app/cuenta.tsx#L80)
- [`savePassword` · línea 86](../frontend/src/app/cuenta.tsx#L86)

### [frontend/src/app/index.tsx](../frontend/src/app/index.tsx)

Pantalla/entrada de Expo Router. Acceso: toma credenciales, llama a la API y entrega la respuesta al contexto de sesión. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/components/social-buttons.tsx](../frontend/src/components/social-buttons.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts).

**Funciones para buscar:**

- [`LoginScreen` · línea 17](../frontend/src/app/index.tsx#L17)
- [`submit` · línea 30](../frontend/src/app/index.tsx#L30)

### [frontend/src/app/recuperar-contrasena.tsx](../frontend/src/app/recuperar-contrasena.tsx)

Pantalla/entrada de Expo Router. Recuperación: solicita un enlace por email sin exigir una sesión previa. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/utils/password.ts](../frontend/src/utils/password.ts).

**Funciones para buscar:**

- [`RecoveryScreen` · línea 14](../frontend/src/app/recuperar-contrasena.tsx#L14)
- [`submit` · línea 18](../frontend/src/app/recuperar-contrasena.tsx#L18)

### [frontend/src/app/registro.tsx](../frontend/src/app/registro.tsx)

Pantalla/entrada de Expo Router. Alta: valida el borrador, solicita crear la cuenta y abre el paso de verificación. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/components/social-buttons.tsx](../frontend/src/components/social-buttons.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/utils/password.ts](../frontend/src/utils/password.ts).

**Funciones para buscar:**

- [`RegisterScreen` · línea 22](../frontend/src/app/registro.tsx#L22)
- [`submit` · línea 30](../frontend/src/app/registro.tsx#L30)

### [frontend/src/app/restablecer-contrasena.tsx](../frontend/src/app/restablecer-contrasena.tsx)

Pantalla/entrada de Expo Router. Contraseña nueva: recibe el token de un enlace profundo o URL y solo informa éxito cuando la API confirma el cambio. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/utils/password.ts](../frontend/src/utils/password.ts).

**Funciones para buscar:**

- [`ResetScreen` · línea 16](../frontend/src/app/restablecer-contrasena.tsx#L16)
- [`submit` · línea 35](../frontend/src/app/restablecer-contrasena.tsx#L35)

### [frontend/src/app/verificar-email.tsx](../frontend/src/app/verificar-email.tsx)

Pantalla/entrada de Expo Router. Verificación: envía el código y controla la espera del reenvío con el vencimiento del servidor. Las operaciones persistentes se delegan a servicios y no se ejecutan como SQL desde el teléfono.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/utils/duration.ts](../frontend/src/utils/duration.ts).

**Funciones para buscar:**

- [`VerifyScreen` · línea 14](../frontend/src/app/verificar-email.tsx#L14)
- [`verify` · línea 27](../frontend/src/app/verificar-email.tsx#L27)
- [`resend` · línea 34](../frontend/src/app/verificar-email.tsx#L34)

### [frontend/src/app/_layout.tsx](../frontend/src/app/_layout.tsx)

Raíz de Expo Router y proveedores de tema, sesión local y sesión social. Espera la restauración y define qué pantallas se pueden mostrar según verificación/rol; la API vuelve a comprobar permisos.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/components/theme-button.tsx](../frontend/src/components/theme-button.tsx), [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx), [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx).

**Funciones para buscar:**

- [`Navigation` · línea 22](../frontend/src/app/_layout.tsx#L22)
- [`RootLayout` · línea 89](../frontend/src/app/_layout.tsx#L89)

### [frontend/src/components/auth-intro.tsx](../frontend/src/components/auth-intro.tsx)

Componente reutilizable auth-intro. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/components/ui/typography.tsx](../frontend/src/components/ui/typography.tsx), [frontend/src/components/icon.tsx](../frontend/src/components/icon.tsx).

**Funciones para buscar:**

- [`AuthIntro` · línea 12](../frontend/src/components/auth-intro.tsx#L12)

### [frontend/src/components/brand.tsx](../frontend/src/components/brand.tsx)

Componente reutilizable brand. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`Brand` · línea 12](../frontend/src/components/brand.tsx#L12)

### [frontend/src/components/delete-confirmation.tsx](../frontend/src/components/delete-confirmation.tsx)

Componente reutilizable delete-confirmation. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx).

**Funciones para buscar:**

- [`DeleteConfirmation` · línea 14](../frontend/src/components/delete-confirmation.tsx#L14)

### [frontend/src/components/icon.tsx](../frontend/src/components/icon.tsx)

Componente reutilizable icon. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Funciones para buscar:**

- [`Icon` · línea 20](../frontend/src/components/icon.tsx#L20)

### [frontend/src/components/social-buttons.tsx](../frontend/src/components/social-buttons.tsx)

Componente reutilizable social-buttons. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx), [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx).

**Funciones para buscar:**

- [`SocialButtons` · línea 13](../frontend/src/components/social-buttons.tsx#L13)

### [frontend/src/components/theme-button.tsx](../frontend/src/components/theme-button.tsx)

Parte del sistema visual: comparte colores, tamaños o preferencia de tema según su implementación. La preferencia de apariencia es independiente de la autenticación y de los datos de las tareas.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/icon.tsx](../frontend/src/components/icon.tsx).

**Funciones para buscar:**

- [`ThemeButton` · línea 14](../frontend/src/components/theme-button.tsx#L14)

### [frontend/src/components/ui/avatar.tsx](../frontend/src/components/ui/avatar.tsx)

Componente reutilizable avatar. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`Avatar` · línea 14](../frontend/src/components/ui/avatar.tsx#L14)

### [frontend/src/components/ui/button.tsx](../frontend/src/components/ui/button.tsx)

Componente reutilizable button. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`Action` · línea 20](../frontend/src/components/ui/button.tsx#L20)

### [frontend/src/components/ui/feedback.tsx](../frontend/src/components/ui/feedback.tsx)

Componente reutilizable feedback. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/ui/typography.tsx](../frontend/src/components/ui/typography.tsx).

**Funciones para buscar:**

- [`Feedback` · línea 13](../frontend/src/components/ui/feedback.tsx#L13)
- [`Loading` · línea 43](../frontend/src/components/ui/feedback.tsx#L43)

### [frontend/src/components/ui/field.tsx](../frontend/src/components/ui/field.tsx)

Componente reutilizable field. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/icon.tsx](../frontend/src/components/icon.tsx).

**Funciones para buscar:**

- [`Field` · línea 21](../frontend/src/components/ui/field.tsx#L21)

### [frontend/src/components/ui/layout.tsx](../frontend/src/components/ui/layout.tsx)

Componente reutilizable layout. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts), [frontend/src/components/brand.tsx](../frontend/src/components/brand.tsx), [frontend/src/components/auth-intro.tsx](../frontend/src/components/auth-intro.tsx), [frontend/src/components/ui/typography.tsx](../frontend/src/components/ui/typography.tsx).

**Funciones para buscar:**

- [`Screen` · línea 25](../frontend/src/components/ui/layout.tsx#L25)
- [`Card` · línea 82](../frontend/src/components/ui/layout.tsx#L82)
- [`AuthLayout` · línea 109](../frontend/src/components/ui/layout.tsx#L109)
- [`Section` · línea 151](../frontend/src/components/ui/layout.tsx#L151)
- [`Columns` · línea 166](../frontend/src/components/ui/layout.tsx#L166)
- [`Actions` · línea 179](../frontend/src/components/ui/layout.tsx#L179)

### [frontend/src/components/ui/typography.tsx](../frontend/src/components/ui/typography.tsx)

Componente reutilizable typography. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

**Se conecta con:** [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx), [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`Copy` · línea 18](../frontend/src/components/ui/typography.tsx#L18)

### [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx)

Componente reutilizable ui. Sus props conectan contenido y acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks recibidos en lugar de suponer que guarda directamente en una base.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [frontend/src/hooks/use-task.ts](../frontend/src/hooks/use-task.ts)

Estado reutilizable de una operación asíncrona: pendiente, éxito y error. Ayuda a deshabilitar acciones mientras trabajan y a no mostrar éxito antes de terminar la petición.

**Funciones para buscar:**

- [`useTask` · línea 9](../frontend/src/hooks/use-task.ts#L9)
- [`run` · línea 14](../frontend/src/hooks/use-task.ts#L14)

### [frontend/src/providers/session-provider.tsx](../frontend/src/providers/session-provider.tsx)

Estado de sesión local compartido entre pantallas. Conserva perfil público, carga y errores; restaura la sesión consultando la API y reacciona cuando la app vuelve al primer plano.

**Se conecta con:** [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts), [frontend/src/types/user.ts](../frontend/src/types/user.ts).

**Funciones para buscar:**

- [`SessionProvider` · línea 34](../frontend/src/providers/session-provider.tsx#L34)
- [`forget` · línea 100](../frontend/src/providers/session-provider.tsx#L100): Borra el transporte local de la sesión y el perfil visible, con un aviso opcional. Esto por sí solo no equivale a revocar la sesión persistida del servidor.
- [`signOut` · línea 110](../frontend/src/providers/session-provider.tsx#L110): Solicita el cierre remoto antes de limpiar el estado local. La pantalla no debe indicar cierre confirmado si la API falló.
- [`accept` · línea 118](../frontend/src/providers/session-provider.tsx#L118): Instala en el contexto el perfil público y el vencimiento recibidos tras login/registro. No es una escritura SQL: la cuenta ya fue procesada por el backend.
- [`useSession` · línea 153](../frontend/src/providers/session-provider.tsx#L153): Entrega el estado y operaciones del proveedor de sesión a una pantalla. Si falta el proveedor, informa el error en vez de fabricar un usuario sin autenticación.

### [frontend/src/providers/social-auth0.tsx](../frontend/src/providers/social-auth0.tsx)

Adaptador entre el SDK de Auth0 y el contexto social. Mantiene las operaciones de la identidad externa separadas de la API de usuarios de RN1.

**Se conecta con:** [frontend/src/providers/social-context.ts](../frontend/src/providers/social-context.ts).

**Funciones para buscar:**

- [`Bridge` · línea 15](../frontend/src/providers/social-auth0.tsx#L15)
- [`signIn` · línea 17](../frontend/src/providers/social-auth0.tsx#L17)
- [`signOut` · línea 35](../frontend/src/providers/social-auth0.tsx#L35): Solicita el cierre remoto antes de limpiar el estado local. La pantalla no debe indicar cierre confirmado si la API falló.
- [`Auth0SocialProvider` · línea 55](../frontend/src/providers/social-auth0.tsx#L55)

### [frontend/src/providers/social-context.ts](../frontend/src/providers/social-context.ts)

Contrato compartido del acceso social: usuario externo, disponibilidad y operaciones. No contiene por sí solo la implementación del proveedor ni credenciales privadas.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [frontend/src/providers/social-provider.tsx](../frontend/src/providers/social-provider.tsx)

Selecciona si el acceso social está disponible en este entorno. La sesión externa es independiente de la cuenta SQL tradicional; no asumir que abrir Auth0 crea automáticamente un usuario local.

**Se conecta con:** [frontend/src/components/ui.tsx](../frontend/src/components/ui.tsx), [frontend/src/providers/social-context.ts](../frontend/src/providers/social-context.ts).

**Funciones para buscar:**

- [`subscribe` · línea 24](../frontend/src/providers/social-provider.tsx#L24)
- [`browserSnapshot` · línea 25](../frontend/src/providers/social-provider.tsx#L25)
- [`serverSnapshot` · línea 26](../frontend/src/providers/social-provider.tsx#L26)
- [`SocialProvider` · línea 32](../frontend/src/providers/social-provider.tsx#L32)
- [`useSocial` · línea 57](../frontend/src/providers/social-provider.tsx#L57)

### [frontend/src/providers/theme-provider.tsx](../frontend/src/providers/theme-provider.tsx)

Comparte paleta y preferencia visual. Persistir el tema no persiste una sesión de usuario: son datos con fines y protecciones diferentes.

**Se conecta con:** [frontend/src/theme.ts](../frontend/src/theme.ts).

**Funciones para buscar:**

- [`ThemeProvider` · línea 22](../frontend/src/providers/theme-provider.tsx#L22)
- [`toggle` · línea 43](../frontend/src/providers/theme-provider.tsx#L43)
- [`useTheme` · línea 54](../frontend/src/providers/theme-provider.tsx#L54)

### [frontend/src/services/apiAccess.ts](../frontend/src/services/apiAccess.ts)

Cliente HTTP móvil/web de RN1. En nativo usa Bearer leído del almacén seguro; en web deja que el navegador envíe cookies. Traduce errores y controla tiempos de espera para las pantallas.

**Se conecta con:** [frontend/src/types/user.ts](../frontend/src/types/user.ts), [frontend/src/services/session-storage.ts](../frontend/src/services/session-storage.ts).

**Funciones para buscar:**

- [`apiUrl` · línea 17](../frontend/src/services/apiAccess.ts#L17): Selecciona la dirección según plataforma y configuración pública. En un teléfono localhost es el propio teléfono; por eso una API en la PC necesita su IP de red. Nunca poner claves en EXPO_PUBLIC_.
- [`onSessionExpired` · línea 52](../frontend/src/services/apiAccess.ts#L52): Registra una función que reaccionará ante una respuesta 401 de una operación autenticada. Devuelve una función para desuscribirse al desmontar y evitar avisos duplicados.
- [`request` · línea 66](../frontend/src/services/apiAccess.ts#L66): Construye la petición con cookie en web o Bearer en nativo y limita la espera a 15 segundos. Una respuesta 401 autenticada limpia el token y avisa a los proveedores; los errores de red o de respuesta se convierten en ApiError. expectedStatus exige una confirmación concreta en cambios de contraseña.
- [`authenticate` · línea 137](../frontend/src/services/apiAccess.ts#L137): Ejecuta login/registro sin exigir una sesión previa. En nativo valida y guarda el token de sesión recibido; en web la cookie llega por el navegador sin copiar el token a JavaScript.
- [`login` · línea 157](../frontend/src/services/apiAccess.ts#L157)
- [`register` · línea 159](../frontend/src/services/apiAccess.ts#L159)
- [`getCurrentUser` · línea 169](../frontend/src/services/apiAccess.ts#L169): Consulta la sesión vigente al iniciar o refrescar la aplicación. Recupera el perfil desde el servidor en vez de confiar en un usuario guardado en localStorage.
- [`logout` · línea 170](../frontend/src/services/apiAccess.ts#L170)
- [`verifyEmailCode` · línea 178](../frontend/src/services/apiAccess.ts#L178): Envía al servidor el código escrito por la persona. La validación definitiva y la actualización del email se realizan en el backend.
- [`resendEmailCode` · línea 187](../frontend/src/services/apiAccess.ts#L187): Solicita al servidor otro envío de verificación. La pantalla no puede generar un código válido cambiando su contador.
- [`requestPasswordRecovery` · línea 195](../frontend/src/services/apiAccess.ts#L195): Envía el email para solicitar un enlace de recuperación. La respuesta genérica evita confirmar públicamente si esa cuenta existe.
- [`resetPassword` · línea 208](../frontend/src/services/apiAccess.ts#L208): Envía el token de recuperación y la contraseña elegida. Un token vencido o usado debe rechazarse aunque el formulario siga abierto.
- [`updateUsername` · línea 215](../frontend/src/services/apiAccess.ts#L215)
- [`updateProfilePicture` · línea 224](../frontend/src/services/apiAccess.ts#L224): Envía la foto seleccionada al endpoint de la cuenta autenticada. Elegir una imagen local no significa que ya se haya guardado en el servidor.
- [`changePassword` · línea 233](../frontend/src/services/apiAccess.ts#L233): Solicita el cambio usando contraseña actual y nueva. Es distinto de recuperar por enlace: aquí ya se dispone de una sesión y se exige la clave vigente.
- [`deleteOwnAccount` · línea 244](../frontend/src/services/apiAccess.ts#L244): Solicita la baja de la cuenta de la sesión actual. El servidor obtiene su identidad desde la sesión, no desde un ID que el formulario pueda alterar.
- [`getAdminUsers` · línea 246](../frontend/src/services/apiAccess.ts#L246)
- [`updateAdminUser` · línea 248](../frontend/src/services/apiAccess.ts#L248)
- [`deleteAdminUser` · línea 256](../frontend/src/services/apiAccess.ts#L256)

### [frontend/src/services/session-storage.ts](../frontend/src/services/session-storage.ts)

Persistencia nativa del token mediante SecureStore. No almacena la contraseña del usuario; el servidor debe seguir validando la sesión en cada solicitud protegida.

**Funciones para buscar:**

- [`readSession` · línea 10](../frontend/src/services/session-storage.ts#L10)
- [`saveSession` · línea 11](../frontend/src/services/session-storage.ts#L11)
- [`clearSession` · línea 13](../frontend/src/services/session-storage.ts#L13)

### [frontend/src/services/session-storage.web.ts](../frontend/src/services/session-storage.web.ts)

Variante elegida para web por la resolución de módulos de Expo. El navegador transporta la cookie HttpOnly y no necesita guardar un token en JavaScript.

**Funciones para buscar:**

- [`readSession` · línea 7](../frontend/src/services/session-storage.web.ts#L7)
- [`saveSession` · línea 8](../frontend/src/services/session-storage.web.ts#L8)
- [`clearSession` · línea 9](../frontend/src/services/session-storage.web.ts#L9)

### [frontend/src/theme.ts](../frontend/src/theme.ts)

Parte del sistema visual: comparte colores, tamaños o preferencia de tema según su implementación. La preferencia de apariencia es independiente de la autenticación y de los datos de las tareas.

**Funciones para buscar:**

- [`pagePadding` · línea 72](../frontend/src/theme.ts#L72)
- [`cardPadding` · línea 75](../frontend/src/theme.ts#L75)
- [`titleSize` · línea 78](../frontend/src/theme.ts#L78)
- [`softShadow` · línea 81](../frontend/src/theme.ts#L81)

### [frontend/src/types/user.ts](../frontend/src/types/user.ts)

Contrato TypeScript de los datos que comparten los módulos. Describe campos y tipos para comprobar el código, pero no crea tablas ni valida por sí solo un JSON recibido en ejecución.

Este archivo define composición, datos, configuración, tipos o reexportaciones. Seguir sus importaciones o buscar dónde se utiliza para ver el efecto en la aplicación.

### [frontend/src/utils/duration.ts](../frontend/src/utils/duration.ts)

Presentación de una duración como minutos y segundos. La interfaz puede contar hacia cero, pero la decisión de aceptar un código sigue siendo del backend.

**Funciones para buscar:**

- [`formatRemainingTime` · línea 12](../frontend/src/utils/duration.ts#L12): Convierte una cantidad de segundos a texto de minutos y segundos y evita duraciones negativas visibles. Es presentación, no una extensión de la vigencia del código.

### [frontend/src/utils/password.ts](../frontend/src/utils/password.ts)

Ayudas compartidas para transformar o validar datos. Usarlas desde varios puntos mantiene las mismas reglas; comprobar sus retornos antes de informar éxito en la interfaz.

**Funciones para buscar:**

- [`getPasswordError` · línea 8](../frontend/src/utils/password.ts#L8)
- [`getUsernameError` · línea 25](../frontend/src/utils/password.ts#L25)
- [`getEmailError` · línea 32](../frontend/src/utils/password.ts#L32)

### [frontend/src/utils/profile-picture.ts](../frontend/src/utils/profile-picture.ts)

Selector de foto para móvil/web. Convierte el resultado permitido al formato que entiende la API y distingue cancelar la selección de guardar una foto nueva.

**Funciones para buscar:**

- [`pickProfilePicture` · línea 9](../frontend/src/utils/profile-picture.ts#L9)

### [frontend/tests/design-system.test.cjs](../frontend/tests/design-system.test.cjs)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Funciones para buscar:**

- [`theme` · línea 8](../frontend/tests/design-system.test.cjs#L8)
- [`luminance` · línea 27](../frontend/tests/design-system.test.cjs#L27)
- [`contrast` · línea 39](../frontend/tests/design-system.test.cjs#L39)

### [frontend/tests/password-flow.test.cjs](../frontend/tests/password-flow.test.cjs)

Pruebas automatizadas y sus ayudas locales. Leer las aserciones para conocer qué comportamiento se comprueba; no equivalen por sí solas a una prueba real de correo, hosting o teléfono.

**Funciones para buscar:**

- [`loadSource` · línea 8](../frontend/tests/password-flow.test.cjs#L8)
- [`apiClient` · línea 41](../frontend/tests/password-flow.test.cjs#L41)
