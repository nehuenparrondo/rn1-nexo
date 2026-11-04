/**
 * Guía de lectura. Acceso a la tabla usuarios y comprobación de hashes bcrypt. Estas
 * funciones se ejecutan en Node.js; las rutas aplican permisos y el frontend recibe solo
 * las respuestas públicas.
 */

// modules/consultas.js
import connection from './db.js';
import bcrypt from 'bcrypt';
import { inTransaction } from './transaction.js';
import { revocarOtrasSesionesDeUsuario } from './sesiones.js';

const CAMPOS_USUARIO =
  'id, username, email, email_verified_at, profile_picture, is_admin';

/**
 * Recibe un término de búsqueda y devuelve los campos de perfil que necesita el panel. El
 * permiso de administrador se comprueba en la ruta antes de llamar a esta consulta.
 */
export async function obtenerPersonasParaAdmin(busqueda = '') {
  const termino = busqueda.trim();
  const [filas] = await connection.query(
    `SELECT ${CAMPOS_USUARIO} FROM usuarios
     WHERE username LIKE CONCAT('%', ?, '%') OR email LIKE CONCAT('%', ?, '%')
     ORDER BY username ASC
     LIMIT 100`,
    [termino, termino],
  );
  return filas;
}

/**
 * Consulta una cuenta por su identificador interno. Devuelve los campos seleccionados de
 * la primera coincidencia, o undefined si no existe.
 */
export async function obtenerPersonaPorId(id) {
  const [filas] = await connection.query(
    `SELECT ${CAMPOS_USUARIO} FROM usuarios WHERE id = ?`,
    [id],
  );
  return filas[0];
}

/**
 * Consulta el email mediante un parámetro SQL. El resultado permite localizar la cuenta
 * para registro, verificación o recuperación; no envía ningún correo por sí mismo.
 */
export async function obtenerPersonaPorEmail(email) {
  const [filas] = await connection.query(
    `SELECT ${CAMPOS_USUARIO} FROM usuarios WHERE email= ?`,
    [email],
  );
  return filas[0];
}

/**
 * Busca el nombre de usuario para comprobar disponibilidad. El valor se pasa como
 * parámetro SQL, no concatenado como una instrucción.
 */
export async function obtenerPersonaPorUsername(username) {
  const [filas] = await connection.query(
    `SELECT ${CAMPOS_USUARIO} FROM usuarios WHERE username = ?`,
    [username],
  );
  return filas[0];
}

/**
 * Busca una cuenta por usuario o email y compara la contraseña ingresada con su hash
 * bcrypt. Devuelve success y los datos públicos, o un mensaje de credenciales incorrectas.
 * La cookie se crea después, en la ruta HTTP.
 */
export async function login(identifier, password) {
  const [filas] = await connection.query(
    'SELECT id, username, email, email_verified_at, profile_picture, is_admin, password_hash FROM usuarios WHERE username = ? OR email = ?',
    [identifier, identifier],
  );
  if (filas.length === 0) {
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  }

  const usuario = filas[0];
  const passwordValida = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordValida) {
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  }
  const { password_hash, ...usuarioPublico } = usuario;
  return { success: true, message: 'Login exitoso', usuario: usuarioPublico };
}

/**
 * Recibe los datos del formulario, rechaza email o usuario ocupados, calcula un hash
 * bcrypt e inserta la cuenta. Devuelve el ID nuevo o un resultado de conflicto. No guarda
 * la contraseña como texto legible.
 */
export async function crearPersona(datos) {
  const { username, email, password } = datos;
  const checkEmail = await obtenerPersonaPorEmail(email);
  const checkUsername = await obtenerPersonaPorUsername(username);
  if (checkEmail) {
    if (checkUsername) {
      return { success: false, message: 'Usuario y email ya en uso' };
    }
    return { success: false, message: 'Email ya en uso' };
  }
  if (checkUsername) {
    return { success: false, message: 'Username ya en uso' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [resultado] = await connection.query(
    `INSERT INTO usuarios (username, email, password_hash)
     VALUES (?, ?, ?)`,
    [username, email, passwordHash],
  );
  return resultado.insertId;
}

/**
 * Actualiza el nombre de la cuenta cuyo ID recibió. La ruta valida formato, disponibilidad
 * y autorización; esta función realiza la escritura SQL.
 */
export async function actualizarUsername(id, datos) {
  const { username } = datos;
  const [resultado] = await connection.query(
    `UPDATE usuarios
     SET username = ?
     WHERE id = ?`,
    [username, id],
  );
  return resultado.affectedRows;
}

/**
 * Calcula un hash nuevo antes de escribir password_hash. No intenta descifrar la
 * contraseña anterior; la recuperación autoriza el cambio mediante un token.
 */
export async function actualizarPassword(id, datos, executor = connection) {
  const { password } = datos;
  const passwordHash = await bcrypt.hash(password, 10);
  const [resultado] = await executor.query(
    `UPDATE usuarios
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, id],
  );
  return resultado.affectedRows;
}

/** Comprueba la contraseña actual antes de guardar la nueva.
 *
 * Para seguir el recorrido: Comprueba con bcrypt la contraseña actual antes de aceptar la
 * nueva. No alcanza con cambiar el texto visible del formulario para modificar la cuenta.
 */
export async function actualizarPasswordConActual(
  id,
  passwordActual,
  passwordNueva,
  tokenActual,
) {
  return inTransaction(async (transaction) => {
    // El bloqueo impide que dos cambios validen simultáneamente la contraseña anterior.
    const [filas] = await transaction.query(
      'SELECT password_hash FROM usuarios WHERE id = ? FOR UPDATE',
      [id],
    );
    if (
      !filas[0] ||
      !(await bcrypt.compare(passwordActual, filas[0].password_hash))
    )
      return false;

    const updated = await actualizarPassword(
      id,
      { password: passwordNueva },
      transaction,
    );
    if (updated !== 1) throw new Error('No se pudo actualizar la contraseña');
    await revocarOtrasSesionesDeUsuario(id, tokenActual, transaction);
    return true;
  });
}

/**
 * Guarda la representación de la foto, o null para quitarla. La ruta y el selector
 * controlan formatos y tamaño; el archivo de imagen no se sube a GitHub como parte del
 * perfil.
 */
export async function actualizarFotoPerfil(id, profilePicture) {
  const [resultado] = await connection.query(
    'UPDATE usuarios SET profile_picture = ? WHERE id = ?',
    [profilePicture, id],
  );
  return resultado.affectedRows;
}

/**
 * Modifica el rol persistido de una cuenta. Es una operación de preparación
 * administrativa, no un permiso que el navegador pueda concederse a sí mismo.
 */
export async function convertirEnAdmin(email) {
  const [resultado] = await connection.query(
    'UPDATE usuarios SET is_admin = 1 WHERE email = ?',
    [email],
  );
  return resultado.affectedRows;
}

/**
 * Elimina la cuenta indicada en usuarios. El alcance sobre sesiones y tokens depende de
 * las relaciones SQL; la ruta decide si se permite borrar esa cuenta.
 */
export async function eliminarPersona(id) {
  const [resultado] = await connection.query(
    'DELETE FROM usuarios WHERE id = ?',
    [id],
  );
  return resultado.affectedRows;
}
