# RN1 · Nexo · Acceso de usuarios

## Entrega con MySQL y bienvenida por props

La ejecución local usa Node.js y la base rn1_nexo de XAMPP. El ingreso correcto
lleva a /bienvenida y entrega el perfil a WelcomePage por props.
Encender MySQL en XAMPP, ejecutar npm start en backend y npm run local -- --web
en frontend. Abrir http://127.0.0.1:8092/.

Consultar [el recorrido de los tres puntos y las tablas](docs/CONSIGNA-LOGIN-MYSQL.md).

El frontend está actualizado a Expo SDK 58 para Expo Go. Consultar
[los cambios de compatibilidad y cómo abrir el QR](docs/EXPO-SDK-58.md).

## Entender el código paso a paso

- [Guía completa de Nexo](docs/LEER-EL-CODIGO.md): ingreso, bienvenida por props, tablas MySQL, sesiones, correo, contraseña, foto, baja y administración.
- [Mapa de archivos y funciones](docs/MAPA-ARCHIVOS-Y-FUNCIONES.md): enlaces al código y conexiones entre módulos.
- [Sesión al consultar Mailtrap](docs/SESION-Y-MAILTRAP.md): corrección de las direcciones locales, persistencia de la cookie y pruebas del cambio de pestaña.

Los comentarios dentro de los archivos explican las decisiones y efectos importantes en español. La documentación distingue ejecución normal, demo y límites pendientes; no contiene claves privadas.

Frontend React Native/Expo y backend Node.js/MySQL separados. Leer también REDISENO.md, MAILTRAP.md y los README internos. La configuración privada debe permanecer fuera de Git.
