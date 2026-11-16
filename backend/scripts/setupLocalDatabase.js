/**
 * Prepara la base exclusiva rn1_nexo en MySQL/MariaDB de XAMPP.
 * La configuración privada se escribe antes de crear recursos para poder
 * reintentar una preparación interrumpida con la misma clave y cuenta SQL.
 */
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import mysql from 'mysql2/promise';

const database = 'rn1_nexo';
const username = 'rn1_nexo_app';
const privateFile = new URL('../.env.local', import.meta.url);
let admin;
let application;

try {
  let settings;
  try {
    settings = parseEnv(await readFile(privateFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (settings && (
    settings.DB_HOST !== '127.0.0.1' || settings.DB_PORT !== '3306' ||
    settings.DB_NAME !== database || settings.DB_USER !== username ||
    !settings.DB_PASSWORD
  )) {
    throw new Error('La configuración local pertenece a otra base. Revísala antes de continuar.');
  }
  admin = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: process.env.DB_ADMIN_USER || 'root',
    password: process.env.DB_ADMIN_PASSWORD || '',
    connectTimeout: 5000,
  });
  if (!settings) {
    const [databases] = await admin.execute(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [database],
    );
    const [accounts] = await admin.execute('SELECT User FROM mysql.user WHERE User = ?', [username]);
    if (databases.length || accounts.length) {
      throw new Error('Ya existe rn1_nexo o su cuenta SQL. Revisa su configuración antes de continuar.');
    }
    settings = {
      DB_HOST: '127.0.0.1',
      DB_PORT: '3306',
      DB_USER: username,
      DB_PASSWORD: randomBytes(32).toString('base64url'),
      DB_NAME: database,
      PORT: '5091',
      HOST: '127.0.0.1',
      FRONTEND_URL: 'http://127.0.0.1:8092,http://localhost:8092',
      PASSWORD_RESET_URL: 'http://127.0.0.1:8092/restablecer-contrasena',
      NODE_ENV: 'development',
    };
    await writeFile(
      privateFile,
      Object.entries(settings).map(([key, value]) => key + '=' + value).join('\n') + '\n',
      { flag: 'wx', mode: 0o600 },
    );
  }
  await admin.query('CREATE DATABASE IF NOT EXISTS rn1_nexo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await admin.changeUser({ database });
  const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
    await admin.query(statement);
  }
  await admin.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [username, '127.0.0.1', settings.DB_PASSWORD]);
  await admin.query('GRANT SELECT, INSERT, UPDATE, DELETE ON rn1_nexo.* TO ?@?', [username, '127.0.0.1']);
  application = await mysql.createConnection({
    host: settings.DB_HOST,
    port: Number(settings.DB_PORT),
    user: settings.DB_USER,
    password: settings.DB_PASSWORD,
    database,
    connectTimeout: 5000,
  });
  const [tables] = await application.query('SHOW TABLES');
  console.log(database + ' preparada y conexión comprobada. Tablas: ' + tables.length);
  console.log('Configuración privada en backend/.env.local. Inicia la API con npm start.');
} catch (error) {
  console.error('No se completó la preparación local: ' + (error.code || error.message));
  process.exitCode = 1;
} finally {
  await application?.end();
  await admin?.end();
}
