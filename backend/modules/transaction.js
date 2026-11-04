/**
 * Guía de lectura. Agrupa varias escrituras en una misma transacción y conexión: se
 * confirman juntas o se revierten si falla alguna. La conexión se libera también en caso
 * de error.
 */

import connection from './db.js';

/** Todas las escrituras de una operación usan la misma conexión del pool.
 *
 * Para seguir el recorrido: Pide una conexión al pool, inicia la transacción y ejecuta
 * work usando esa conexión. Confirma si termina bien, revierte si lanza error y siempre
 * libera la conexión.
 */
export async function inTransaction(work) {
  const transaction = await connection.getConnection();
  try {
    await transaction.beginTransaction();
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.release();
  }
}
