import bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'node:crypto';

/** Almacenamiento efímero para mostrar la app sin MySQL. Nunca usar en producción. */
export async function createDemoServices() {
  const users = [];
  const sessions = new Map();
  const codes = new Map();
  const resets = new Map();
  let nextId = 1;
  const byId = (id) => users.find((user) => user.id === Number(id));
  const matches = (first, second) =>
    first.toLowerCase() === second.toLowerCase();
  const revoke = (id, except) => {
    for (const [token, session] of sessions) {
      if (session.id === Number(id) && token !== except) sessions.delete(token);
    }
  };
  for (const [username, isAdmin] of [
    ['demo_admin', 1],
    ['demo_usuario', 0],
  ]) {
    users.push({
      id: nextId++,
      username,
      email: username + '@example.test',
      password_hash: await bcrypt.hash('DemoAcceso123', 8),
      email_verified_at: new Date().toISOString(),
      profile_picture: null,
      is_admin: isAdmin,
    });
  }
  return {
    NOMBRE_COOKIE_SESION: 'sesion_id',
    opcionesCookieSesion: () => ({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    }),
    obtenerPersonaPorId: async (id) => byId(id),
    obtenerPersonaPorEmail: async (email) =>
      users.find((user) => matches(user.email, email)),
    obtenerPersonaPorUsername: async (username) =>
      users.find((user) => matches(user.username, username)),
    obtenerPersonasParaAdmin: async (query) =>
      users
        .filter((user) =>
          (user.username + ' ' + user.email)
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 100),
    crearPersona: async ({ username, email, password }) => {
      if (
        users.some(
          (user) =>
            matches(user.username, username) || matches(user.email, email),
        )
      ) {
        return { success: false, message: 'El usuario o email ya existe.' };
      }
      const passwordHash = await bcrypt.hash(password, 8);
      const id = nextId++;
      users.push({
        id,
        username,
        email,
        password_hash: passwordHash,
        email_verified_at: null,
        profile_picture: null,
        is_admin: 0,
      });
      return id;
    },
    login: async (identifier, password) => {
      const usuario = users.find(
        (user) =>
          matches(user.username, identifier) || matches(user.email, identifier),
      );
      return usuario && (await bcrypt.compare(password, usuario.password_hash))
        ? { success: true, usuario }
        : { success: false, message: 'Usuario o contraseña incorrectos.' };
    },
    crearSesion: async (id) => {
      const token = randomBytes(32).toString('hex');
      sessions.set(token, { id, expires: Date.now() + 8 * 60 * 60 * 1000 });
      return token;
    },
    obtenerUsuarioPorSesion: async (token) => {
      const session = sessions.get(token);
      return session && session.expires > Date.now() ? byId(session.id) : null;
    },
    revocarSesion: async (token) => sessions.delete(token),
    crearCodigoVerificacion: async (id) => {
      const codigo = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 60000).toISOString();
      codes.set(id, { codigo, expiresAt, attempts: 0 });
      return { codigo, expiresAt };
    },
    verificarCodigoVerificacion: async (id, codigo) => {
      const record = codes.get(id);
      if (
        !record ||
        record.attempts >= 5 ||
        Date.parse(record.expiresAt) <= Date.now()
      ) {
        return { success: false, message: 'El código no es válido o expiró.' };
      }
      record.attempts++;
      if (record.codigo !== codigo)
        return { success: false, message: 'El código no es válido o expiró.' };
      byId(id).email_verified_at = new Date().toISOString();
      codes.delete(id);
      return { success: true };
    },
    crearEnlaceRecuperacion: async (id) => {
      for (const [token, reset] of resets)
        if (reset.id === id) resets.delete(token);
      const token = randomBytes(32).toString('hex');
      resets.set(token, { id, expires: Date.now() + 900000 });
      const link = new URL(
        process.env.PASSWORD_RESET_URL ?? 'rn1://restablecer-contrasena',
      );
      link.searchParams.set('token', token);
      return link.toString();
    },
    restablecerPasswordConToken: async (token, password) => {
      const reset = resets.get(token);
      if (!reset || reset.expires <= Date.now() || !byId(reset.id)) {
        return { success: false, message: 'El enlace no es válido o expiró.' };
      }
      const passwordHash = await bcrypt.hash(password, 8);
      if (!resets.delete(token))
        return { success: false, message: 'El enlace ya se utilizó.' };
      byId(reset.id).password_hash = passwordHash;
      revoke(reset.id);
      return { success: true };
    },
    actualizarUsername: async (id, { username }) => {
      byId(id).username = username;
    },
    actualizarFotoPerfil: async (id, picture) => {
      byId(id).profile_picture = picture;
    },
    actualizarPasswordConActual: async (id, current, password, token) => {
      const user = byId(id);
      if (!user || !(await bcrypt.compare(current, user.password_hash)))
        return false;
      user.password_hash = await bcrypt.hash(password, 8);
      revoke(id, token);
      return true;
    },
    eliminarPersona: async (id) => {
      const index = users.findIndex((user) => user.id === Number(id));
      if (index === -1) return 0;
      users.splice(index, 1);
      revoke(id);
      codes.delete(Number(id));
      for (const [token, reset] of resets)
        if (reset.id === Number(id)) resets.delete(token);
      return 1;
    },
  };
}
