# RN1 · Nexo · Acceso de usuarios

## Entrega con MySQL y bienvenida por props

La ejecución local usa Node.js y la base rn1_nexo de XAMPP. El ingreso correcto
lleva a /bienvenida y entrega el perfil a WelcomePage por props.
Encender MySQL en XAMPP, ejecutar npm start en backend y npm run local -- --web
en frontend. Abrir http://127.0.0.1:8092/.

Consultar [el recorrido de los tres puntos y las tablas](docs/CONSIGNA-LOGIN-MYSQL.md).

## Entender el código paso a paso

- [Guía sencilla de funcionamiento](docs/LEER-EL-CODIGO.md): recorrido de los datos, guardado, pantallas y operaciones.
- [Mapa de archivos y funciones](docs/MAPA-ARCHIVOS-Y-FUNCIONES.md): enlaces al código y conexiones entre módulos.

Los comentarios dentro de los archivos explican las decisiones y efectos importantes en español. La documentación distingue ejecución normal, demo y límites pendientes; no contiene claves privadas.

Frontend React Native/Expo y backend Node.js/MySQL separados. Leer también REDISENO.md, MAILTRAP.md y los README internos. La configuración privada debe permanecer fuera de Git.
