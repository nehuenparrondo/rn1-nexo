/**
 * Guía de lectura. Arranque normal de RN1: reúne los servicios SQL y de correo, construye
 * createApp y abre el puerto configurado. A diferencia de demo/server.js, este modo
 * requiere MySQL.
 */

import { createApp } from './app.js';
import * as consultas from './modules/consultas.js';
import * as sesiones from './modules/sesiones.js';
import * as correo from './modules/correo.js';
import * as verificacion from './modules/verificacionEmail.js';
import * as recuperacion from './modules/recuperacionPassword.js';

const app = createApp({
  ...consultas,
  ...sesiones,
  ...correo,
  ...verificacion,
  ...recuperacion,
});
const port = Number(process.env.PORT ?? 3005);

// createApp configura CORS antes de las rutas; FRONTEND_URL define los orígenes permitidos.
app.listen(port, '0.0.0.0', () =>
  console.log(`API escuchando en el puerto ${port}`),
);
