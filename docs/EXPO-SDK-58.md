# RN1 · Compatibilidad con Expo SDK 58

Actualización del 17 de noviembre de 2026 para abrir RN1 con Expo Go de SDK 58.

## Qué versión se debe mirar

La versión de SDK que informa Expo es **58.0.0**. El paquete `expo` recibe parches
dentro de esa familia, por eso `frontend/package.json` utiliza `~58.0.26`.
`app.json` conserva `version: "1.0.0"`: ese campo es la versión de la aplicación,
no la versión de Expo. Cambiar solamente ese campo no resuelve una incompatibilidad
con Expo Go.

Se alinearon las dependencias con `expo install --fix`: React 19.3.0, React Native
0.88.1, Router 58 y los módulos nativos compatibles. El archivo package-lock.json
permite reproducir la instalación mediante npm ci.

## Adaptaciones del código

- `frontend/src/components/ui/field.tsx`: la referencia al campo utiliza
  `TextInputInstance`, conforme a los tipos estrictos de React Native.
- `frontend/src/app/+html.tsx`: `useServerDocumentContext` entrega los atributos,
  recursos y scripts que necesita SDK 58 para activar la versión web.
- `frontend/src/app/admin.tsx`: el componente de lista vacía recibe `undefined`
  cuando hay un error, conforme al contrato estricto de FlatList. El mensaje de
  error continúa mostrándose en la cabecera.
- Las pantallas conservan los últimos cambios solicitados: el ingreso no muestra
  el enlace de recuperación y Mi cuenta no muestra eliminación propia.

El backend y su esquema MySQL conservan sus funcionalidades. Esta actualización
corresponde al frontend y a su compatibilidad con Expo.

## Abrir en el teléfono

1. Conectar el teléfono al Wi-Fi de la misma red que la computadora.
2. Mantener MySQL de XAMPP y la API de backend en ejecución.
3. En frontend ejecutar `npm run local -- --clear`.
4. Escanear el QR con la cámara del iPhone y elegir Expo Go.

La configuración privada del frontend distingue dos direcciones:
`EXPO_PUBLIC_API_URL` para el navegador y `EXPO_PUBLIC_NATIVE_API_URL` para el
teléfono. La segunda debe contener la IP actual de la PC, con el puerto 5091
y `/api`. Si cambia la red, actualizar ese valor y reiniciar Expo. En el teléfono,
127.0.0.1 identifica al propio teléfono.

El backend debe escuchar en una dirección accesible desde esa red. La API usa las
mismas tablas y valida sesiones y permisos tanto en móvil como en web.

## Comprobaciones del 17 de noviembre

| Comprobación | Resultado |
| --- | --- |
| npm run typecheck | Correcto. |
| npm run lint | Correcto. |
| node --test tests/*.test.cjs | 26 pruebas aprobadas. |
| npx expo install --check | Dependencias alineadas con SDK 58. |
| npx expo-doctor | 20 de 20 comprobaciones aprobadas. |
| npm run build:all -- --max-workers 2 | Exportación de iOS, Android y web correcta. |
| Manifiesto de Expo Go para iOS por la red local | HTTP 200, sdkVersion 58.0.0 y runtime exposdk:58.0.0. |
| Navegador tras recargar | Mi cuenta se representa y restaura la sesión existente. |

La comprobación en el iPhone físico se completa escaneando el QR. La exportación
valida el empaquetado de las plataformas; no sustituye una prueba en el dispositivo.

### Avisos de dependencias

La auditoría de npm del mismo día registra 43 hallazgos transitivos: 41 altos y
2 moderados, asociados a minimatch/picomatch y sus dependientes. Las correcciones
forzadas propuestas por npm incluyen cambiar a SDK y librerías incompatibles con
esta migración. Se conservaron las versiones recomendadas por Expo; esos avisos
quedan pendientes de una actualización compatible. Pueden consultarse con npm audit.

## Documentación oficial

- [Actualización oficial de SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).
- [Migración de Router 57 a 58](https://docs.expo.dev/router/migrate/sdk-57-to-58/).
- [Tipos estrictos de React Native](https://reactnative.dev/docs/strict-typescript-api).
