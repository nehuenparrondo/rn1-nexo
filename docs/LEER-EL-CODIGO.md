# Consigna 6 · Nexo, acceso móvil con API Node/MySQL

## Las dos mitades

frontend contiene React Native/Expo/TypeScript y las pantallas de Expo Router. backend contiene Express y los servicios SQL y correo. El teléfono hace HTTP a la API: no debe conocer las credenciales MySQL ni abrir una conexión SQL directa.

## Normal no es lo mismo que demo

- backend/server.js reúne servicios reales: módulos SQL, sesiones, verificación y correo. Requiere MySQL y el esquema backend/database/schema.sql.
- backend/demo/server.js llama a createApp con servicios de demo/services.js: usuarios, sesiones y códigos temporales en memoria, con correo a Mailtrap Sandbox. Se rechaza producción. Reiniciar borra las cuentas de esta demo.
- backend/app.js define los mismos endpoints para ambos modos; esa inyección permite probar pantallas sin decir que la demo tiene persistencia SQL.

## 1. Desde el formulario al usuario registrado

El ingreso verificado ahora llega a /bienvenida. La ruta app/bienvenida.tsx
recibe el perfil del contexto y lo entrega por user={session.user} a
pages/WelcomePage.tsx. Ese componente muestra la bienvenida mediante props.
La configuración local persistente y los tres puntos de la consigna se explican
en [Ingreso, bienvenida y MySQL](CONSIGNA-LOGIN-MYSQL.md).

src/app/registro.tsx mantiene borradores y revisa los campos → apiAccess.register → POST /api/personas → createApp valida en servidor → consultas.crearPersona comprueba duplicados y guarda bcrypt en usuarios. La ruta abre una sesión inicial y solicita un código. Una cuenta no verificada todavía tiene restricciones aunque exista una sesión.

src/app/index.tsx usa el mismo cliente para login. consultas.login compara bcrypt; la ruta crea la sesión y devuelve el perfil público. SessionProvider.accept actualiza el usuario del contexto y el vencimiento del código. No guarda una contraseña en el contexto.

## 2. Cómo recuerda la sesión según plataforma

| Lugar | Cómo transporta la sesión | Dónde se conserva |
| --- | --- | --- |
| Navegador | Cookie HttpOnly, credentials: include | El navegador; session-storage.web.ts no copia el token a JavaScript. |
| iPhone/Android | Authorization: Bearer con token aleatorio | SecureStore mediante session-storage.ts. |
| Servidor normal | Hash del token y usuario asociado | Tabla sesiones_usuario de MySQL. |

sessionTransport prioriza Authorization si está presente; una cabecera inválida no debe caer silenciosamente a otra cookie. La marca X-Client-Platform escoge transporte, no concede permisos.

SessionProvider consulta /sesion al iniciar y al volver a primer plano. Un 401 limpia la sesión local y avisa a la interfaz. La pantalla _layout espera la restauración y decide qué rutas mostrar según verificación y rol; la API vuelve a exigir los permisos.

## 3. Verificar y recuperar contraseña

verificar-email.tsx envía el código del correo y actualiza el perfil confirmado. El contador usa el vencimiento recibido; no crea códigos válidos por sí mismo. En Sandbox los mensajes se leen en Mailtrap, no en Gmail.

recuperar-contrasena.tsx solicita un enlace. recuperacionPassword.crearEnlaceRecuperacion genera un token de 15 minutos y usa PASSWORD_RESET_URL para construir el destino web/nativo. restablecer-contrasena.tsx toma el token del enlace, valida el borrador y envía la nueva clave; apiAccess exige la confirmación HTTP 204 para no mostrar un cambio inexistente.

En backend, restablecerPasswordConToken usa inTransaction y bloqueo de la fila: consume el token, actualiza el hash y revoca sesiones dentro de la misma transacción. Si una escritura falla, revierte la operación. La contraseña anterior no se descifra ni se envía por correo.

## 4. Perfil, props y sesión social

cuenta.tsx separa el borrador de nombre/foto de los datos confirmados. useTask mantiene pendiente/error/éxito para cada acción. Elegir una foto no la guarda hasta que la API lo confirme. Components como Avatar, Field, Action y Copy reciben datos o callbacks por props: buscar dónde se instancian muestra quién es dueño del dato.

SocialProvider/Auth0 y cuenta-auth0.tsx son una sesión externa separada: no asumir que crea o vincula automáticamente la cuenta SQL tradicional. El SDK nativo requiere development build y configuración propia; Expo Go no hace disponible una librería nativa arbitraria por instalar su paquete.

## Direcciones y configuración

apiAccess.apiUrl escoge EXPO_PUBLIC_API_URL y, para teléfono, EXPO_PUBLIC_NATIVE_API_URL. En un iPhone localhost significa el iPhone; una API en la PC necesita su dirección de red y conectividad. EXPO_PUBLIC_ es configuración visible: nunca colocar ahí MAIL_API_KEY, DB_PASSWORD ni secretos OAuth. backend/.env sí es privado.

## Ejecutar y comprobar

Instalar con npm ci dentro de backend y frontend. El backend normal se inicia con npm start; la demo con npm run demo. El frontend tiene su configuración de ejemplo normal y de demo: completar direcciones propias antes de iniciar. Consultar los README internos y MAILTRAP.md; no confundir las variables MAIL_INBOX_ID de RN1 y MAILTRAP_INBOX_ID de Vértice.

Backend: npm test (pruebas aisladas). Frontend: typecheck, lint, test:password, test:ui y build:web. Las comprobaciones de documentación no envían correo ni ejecutan migraciones sobre cuentas reales. Referencia del SDK utilizado: https://docs.expo.dev/versions/v57.0.0/.

## Encontrar una función en el editor

En el archivo de código, los bloques de comentario explican responsabilidades, entradas/salidas y efectos importantes. Buscar el nombre con Ctrl+F permite encontrar la función; después usar Buscar referencias para ver quién la llama. El mapa siguiente incluye enlaces a los archivos reales y a las líneas vigentes al documentar.

[Mapa de archivos y funciones](MAPA-ARCHIVOS-Y-FUNCIONES.md).

Documentación en español del código activo. No se cambiaron instrucciones ejecutables, dependencias, secretos ni datos. Los respaldos con fechas, node_modules, compilaciones y archivos privados no son el código activo documentado. Los resultados de comprobación se registran por separado y no certifican servicios externos ni requisitos pendientes.
