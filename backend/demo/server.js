import { createApp } from '../app.js';
import * as correo from '../modules/correo.js';
import { createDemoServices } from './services.js';

if (
  process.env.NODE_ENV === 'production' ||
  process.env.MAIL_SANDBOX?.trim() === 'false'
) {
  throw new Error(
    'La demo solo admite desarrollo con Mailtrap Sandbox. No usar en producción.',
  );
}
const services = await createDemoServices();
const app = createApp({ ...services, ...correo });
const port = Number(process.env.DEMO_PORT ?? 5091);
const host = process.env.DEMO_HOST ?? '127.0.0.1';
app.listen(port, host, () => {
  console.log(
    `RN1: demo temporal en el puerto ${port}, con Mailtrap Sandbox. Los usuarios se borran al reiniciar.`,
  );
  console.log(
    'Los códigos y enlaces se consultan en My Sandbox, no en un outbox local.',
  );
});
