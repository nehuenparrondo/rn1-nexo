/**
 * Guía de lectura. Contrato TypeScript de los datos que comparten los módulos. Describe
 * campos y tipos para comprobar el código, pero no crea tablas ni valida por sí solo un
 * JSON recibido en ejecución.
 */

// Representa los datos públicos que devuelve la API. Nunca contiene contraseñas.
export type User = {
  username: string;
  email: string;
  email_verified_at: string | null;
  profile_picture: string | null;
  role: 'user' | 'admin';
};

export type AdminUser = User & { id: number };
