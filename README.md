# UberClone Conductor

Proyecto final: clon del perfil de **conductor** de Uber, hecho con **React Native + Expo** y un **backend Node/Express**.

Qué permite hacer la app:

1. **Registrarse** como conductor en 3 pestañas (datos personales, vehículo y documentos), con validaciones y subida de fotos.
2. Quedar en estado **pendiente de aprobación** hasta que se cambie a `approved` en la base de datos.
3. Ponerse **Disponible**, ver su ubicación en un **mapa** y guardarla en Firestore.
4. **Recibir solicitudes de viaje** en tiempo real con un temporizador de 15 s, con **notificación push (FCM)**, ver la tarifa y ganancia estimadas, y **aceptar o rechazar**.
5. Seguir el **viaje en curso** con la ruta en el mapa y **cobrarlo**: en efectivo o con **Mercado Pago** (modo de prueba).
6. Consultar el **historial** (filtros, paginación y detalle con ruta), las **ganancias** por día, semana y mes, y el **perfil** (datos editables).
7. Conservar la **sesión** y las **preferencias** al cerrar la app (AsyncStorage).

## Tecnologías

| Capa                   | Tecnología                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Framework              | React Native + Expo (development build con `expo-dev-client`)                                |
| Navegación             | React Navigation (Stack, Bottom Tabs y Drawer)                                               |
| Estado global          | Context API (`DriverContext`, `RegistroContext`, `TripContext`)                              |
| Base de datos          | Firebase Firestore (SDK `firebase`, escuchas en tiempo real con `onSnapshot`)                |
| Notificaciones         | Firebase Cloud Messaging (`@react-native-firebase/messaging`)                                |
| Backend                | Node.js + Express + `firebase-admin` (push y pagos)                                          |
| Pagos                  | Mercado Pago Checkout Pro (credenciales de prueba) dentro de `react-native-webview`          |
| Imágenes               | Cloudinary (preset sin firma)                                                                |
| Mapas y rutas          | `react-native-maps` (Google Maps o tiles alternos) y OSRM para calcular la ruta              |
| Ubicación              | `@react-native-community/geolocation`                                                        |
| Almacenamiento local   | `@react-native-async-storage/async-storage`                                                  |
| Fotos, fechas y listas | `expo-image-picker`, `@react-native-community/datetimepicker`, `@react-native-picker/picker` |

## Requisitos

- Node.js 18 o superior y npm
- Android Studio (emulador con Google Play) o un teléfono Android
- Un proyecto de Firebase con Firestore y Cloud Messaging, y su `google-services.json`
- Una **llave de cuenta de servicio** de Firebase para el backend (Configuración del proyecto > Cuentas de servicio)
- Una cuenta de Cloudinary con un _upload preset_ **sin firma**
- Una aplicación de Mercado Pago (Checkout Pro, API de Preferences) y su **Access Token de prueba**
- (Opcional) Una clave de Google Maps. Sin clave, la app dibuja el mapa con tiles de OpenStreetMap/CARTO.

## Instalación y ejecución

Son **dos procesos**, cada uno en su propia terminal.

**1. Backend** (carpeta `backend`)

```bash
cd backend
npm install
cp .env.example .env              # y completa los valores
# guarda la llave de Firebase como backend/serviceAccountKey.json
npm start                         # http://localhost:3000/health -> {"ok":true}
```

**2. App** (carpeta raíz)

```bash
npm install
cp .env.example .env              # y completa los valores
npx expo prebuild --clean         # solo la primera vez o si cambian permisos / claves nativas
npx expo run:android              # genera y abre la development build
npx expo start -c                 # servidor de desarrollo
```

> La app usa módulos con código nativo, por eso **no funciona en Expo Go**: requiere development build.
> Coloca tu archivo `google-services.json` en la raíz (está en `.gitignore`, no se sube a GitHub).
> El emulador de Android alcanza el backend del PC en `http://10.0.2.2:3000`. En un teléfono real usa la IP del PC en la red.

### Variables de entorno de la app (`.env` en la raíz)

| Variable                               | Para qué sirve                                                       |
| -------------------------------------- | -------------------------------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`         | Clave de la app web de Firebase                                      |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`     | Dominio de autenticación de Firebase                                 |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`      | ID del proyecto de Firebase                                          |
| `EXPO_PUBLIC_FIREBASE_APP_ID`          | ID de la app de Firebase                                             |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`      | Clave de Google Maps (opcional)                                      |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Nombre de la nube de Cloudinary                                      |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset de subida sin firma                                           |
| `EXPO_PUBLIC_BACKEND_URL`              | URL del backend (`http://10.0.2.2:3000` en el emulador)              |
| `EXPO_PUBLIC_PAYMENT_RETURN_URL`       | URL de retorno del checkout; debe ser igual a la del backend         |

### Variables de entorno del backend (`backend/.env`)

| Variable             | Para qué sirve                                                                    |
| -------------------- | --------------------------------------------------------------------------------- |
| `PORT`               | Puerto del servidor (3000 por defecto)                                            |
| `MP_ACCESS_TOKEN`    | Access Token de **prueba** de Mercado Pago                                        |
| `PAYMENT_RETURN_URL` | URL https de retorno del checkout (la app la intercepta en el WebView)            |
| `PUBLIC_URL`         | (Opcional) URL pública del backend para el webhook de Mercado Pago                |

La llave de Firebase se guarda en `backend/serviceAccountKey.json`.

**Seguridad:** `.env`, `backend/.env`, `google-services.json` y `serviceAccountKey.json` están en `.gitignore` y nunca se suben. Los archivos `.env.example` son las plantillas.

## Árbol de carpetas

```
UberCloneDriver/
├── assets/
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── backend/
│   ├── src/
│   │   ├── firebase.js
│   │   ├── payments.js
│   │   ├── server.js
│   │   └── tripWatcher.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── docs/
│   └── AI_LOG.md
├── src/
│   ├── components/
│   │   ├── Boton.js
│   │   ├── CampoCheck.js
│   │   ├── CampoFecha.js
│   │   ├── CampoFoto.js
│   │   ├── CampoSelect.js
│   │   ├── CampoTexto.js
│   │   ├── FormScroll.js
│   │   ├── MapaBase.js
│   │   └── ScreenPlaceholder.js
│   ├── config/
│   │   ├── backend.js
│   │   ├── firebase.js
│   │   ├── map.js
│   │   ├── options.js
│   │   ├── pricing.js
│   │   └── trips.js
│   ├── context/
│   │   ├── DriverContext.js
│   │   ├── RegistroContext.js
│   │   └── TripContext.js
│   ├── hooks/
│   │   ├── useDriverLocation.js
│   │   ├── useEarnings.js
│   │   ├── usePushNotifications.js
│   │   ├── useTripHistory.js
│   │   └── useTripRequests.js
│   ├── navigation/
│   │   ├── CustomDrawerContent.js
│   │   ├── DrawerNavigator.js
│   │   ├── navigationRef.js
│   │   ├── RegistroTabs.js
│   │   └── RootNavigator.js
│   ├── screens/
│   │   ├── registro/
│   │   │   ├── DatosPersonalesScreen.js
│   │   │   ├── DocumentosScreen.js
│   │   │   └── VehiculoScreen.js
│   │   ├── CobroScreen.js
│   │   ├── ConfiguracionScreen.js
│   │   ├── DetalleViajeScreen.js
│   │   ├── GananciasScreen.js
│   │   ├── HistorialScreen.js
│   │   ├── InicioScreen.js
│   │   ├── PagoMercadoPagoScreen.js
│   │   ├── PerfilScreen.js
│   │   ├── SolicitudScreen.js
│   │   └── ViajeEnCursoScreen.js
│   ├── services/
│   │   ├── driverService.js
│   │   ├── imageService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── preferencesService.js
│   │   ├── routeService.js
│   │   ├── sessionService.js
│   │   └── tripService.js
│   ├── theme/
│   │   └── index.js
│   └── utils/
│       ├── calculateFare.js
│       ├── format.js
│       └── validators.js
├── .env.example
├── .gitignore
├── app.config.js
├── App.js
├── app.json
├── index.js
├── LICENSE
├── package.json
└── README.md
```

## Responsabilidad de cada archivo

### Raíz del proyecto

| Archivo                              | Responsabilidad                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`                           | Punto de entrada. Importa `react-native-gesture-handler` (debe ir primero) y registra `App` con `registerRootComponent`.                                   |
| `App.js`                             | Arma el árbol de providers (`SafeAreaProvider` → `DriverProvider` → `RegistroProvider` → `TripProvider`) y el `NavigationContainer` con `navigationRef`.   |
| `app.json`                           | Configuración de Expo: nombre, paquete Android, permisos de ubicación, `google-services.json` y plugins (datetimepicker, Firebase, image-picker, fuentes). |
| `app.config.js`                      | Extiende `app.json` e inyecta la clave de Google Maps desde `.env`, para que nunca quede escrita en un archivo versionado.                                 |
| `package.json` / `package-lock.json` | Dependencias, versiones exactas y scripts (`start`, `android`, `ios`, `web`).                                                                              |
| `.env.example`                       | Plantilla de variables de entorno, sin valores secretos.                                                                                                   |
| `.gitignore`                         | Evita subir `node_modules`, `.env`, `google-services.json`, carpetas nativas generadas, llaves y archivos `.zip`.                                          |
| `backend/`                           | Servidor Node/Express: notificaciones push y pagos con Mercado Pago (ver sección *Backend*).                                                               |
| `LICENSE`                            | Licencia del proyecto.                                                                                                                                     |
| `README.md`                          | Este documento.                                                                                                                                            |
| `assets/`                            | Íconos de la app (iconos adaptativos de Android), favicon y splash.                                                                                        |
| `docs/AI_LOG.md`                     | Bitácora de uso de IA: objetivo, resumen, archivos afectados, verificación y aprendizaje de cada entrada.                                                  |

### `src/config/` — constantes y configuración

| Archivo       | Responsabilidad                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `firebase.js` | Inicializa Firebase con las variables del `.env` y exporta `db` (Firestore con detección automática de _long polling_). Solo `services/` lo importa. |
| `map.js`      | URL y atribución de los tiles del mapa alterno (OpenStreetMap/CARTO) cuando no hay clave de Google.                                                  |
| `options.js`  | Opciones de las listas desplegables: género, idioma, categoría del vehículo y color.                                                                 |
| `pricing.js`  | Parámetros de la tarifa: base, precio por km y por minuto, tarifa mínima, comisión (20 %), redondeo y multiplicadores por categoría.                 |
| `trips.js`    | Tiempo para responder una solicitud (15 s), estados posibles de un viaje (`TRIP_STATUS`) y etiquetas de métodos de pago.                             |
| `backend.js`  | URL del backend y URL de retorno del pago (variables `EXPO_PUBLIC_BACKEND_URL` y `EXPO_PUBLIC_PAYMENT_RETURN_URL`). |

### `src/theme/`

| Archivo    | Responsabilidad                                                              |
| ---------- | ---------------------------------------------------------------------------- |
| `index.js` | Sistema de diseño: colores, espaciados, radios de borde y tamaños de fuente. |

### `src/utils/` — lógica pura (sin efectos secundarios)

| Archivo            | Responsabilidad                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `calculateFare.js` | Calcula tarifa, comisión y ganancia del conductor a partir de distancia, duración, categoría y propina.                                                                                                                      |
| `format.js`        | Formatea fechas (`toISODate`, `formatDate`), porcentajes y pesos colombianos (`formatCOP`).                                                                                                                                  |
| `validators.js`    | Valores iniciales del formulario, campos por sección y todas las validaciones (nombre, documento, celular, edad mínima, placa, año, capacidad, vencimientos, correo, términos) más la regla de la revisión técnico-mecánica. |

### `src/services/` — acceso a datos y almacenamiento (única capa que habla con servicios externos)

| Archivo                 | Responsabilidad                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `driverService.js`      | Registra al conductor en Firestore (sube las 5 fotos en paralelo, estado `pending`), escucha su documento en tiempo real, edita el perfil (`updateDriverProfile`), guarda el token FCM, cambia su disponibilidad y guarda su última ubicación. |
| `tripService.js`        | Escucha solicitudes y el viaje activo en tiempo real, acepta o rechaza con transacción (solo si sigue en `requested`) y crea un viaje de prueba.                                 |
| `imageService.js`       | Sube una imagen a Cloudinary con preset sin firma usando `XMLHttpRequest` y devuelve su URL pública.                                                                             |
| `sessionService.js`     | Guarda, lee y borra el `driverId` de la sesión en AsyncStorage.                                                                                                                  |
| `preferencesService.js` | Guarda y lee preferencias (idioma, última disponibilidad) en AsyncStorage con prefijo `pref:`.                                                                                   |
| `routeService.js`       | Pide a OSRM la ruta entre dos puntos y devuelve coordenadas, distancia y duración.                                            |
| `notificationService.js` | Permiso de notificaciones, token FCM y listeners de mensajes (única capa que usa `@react-native-firebase/messaging`).       |
| `paymentService.js`    | Llama al backend para crear el pago de Mercado Pago y confirmarlo. Nunca habla con Mercado Pago directamente.                 |

### `src/context/` — estado compartido

| Archivo              | Responsabilidad                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DriverContext.js`   | Sesión del conductor: restaura el `driverId` al abrir la app, escucha su documento en tiempo real, expone `signIn`, `signOut`, `isApproved` y `toggleAvailability`. |
| `RegistroContext.js` | Estado del formulario de registro: valores, errores por sección, campos visitados, envío y mensajes de error.                                                       |
| `TripContext.js`     | Solicitud entrante y viaje activo: abre la pantalla de solicitud cuando llega una, la cierra cuando desaparece y expone `acceptRequest` / `rejectRequest`.          |

### `src/hooks/` — hooks personalizados

| Archivo                | Responsabilidad                                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDriverLocation.js` | Pide el permiso de ubicación y sigue la posición del dispositivo con `watchPosition`, limpiando con `clearWatch`.                                   |
| `useTripRequests.js`   | Se suscribe a las solicitudes del conductor, corre la cuenta regresiva de 15 s, rechaza automáticamente al llegar a 0 y ofrece `accept` y `reject`. |
| `useEarnings.js`       | Escucha los viajes cobrados y calcula con `useMemo` el resumen de hoy, semana y mes, y el saldo.                                 |
| `useTripHistory.js`    | Historial paginado de 20 en 20, filtros por fecha y método de pago, y recarga manual.                                            |
| `usePushNotifications.js` | Pide el permiso, guarda el token FCM del conductor y escucha mensajes, limpiando los listeners al salir.                      |

### `src/navigation/`

| Archivo              | Responsabilidad                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RootNavigator.js`   | Stack principal: Registro, Main, Solicitud, ViajeEnCurso, Cobro, PagoMercadoPago y DetalleViaje. Elige la ruta inicial según haya sesión y muestra un spinner mientras se restaura. |
| `RegistroTabs.js`    | Tabs del registro (Datos personales, Vehículo, Documentos) con íconos y una marca "!" cuando hay errores visibles.                                   |
| `DrawerNavigator.js` | Menú lateral: Inicio, Perfil, Historial, Ganancias y Configuración.                                                                                  |
| `CustomDrawerContent.js` | Contenido del menú lateral con la foto, el nombre y el estado del conductor. |
| `navigationRef.js`   | Referencia de navegación para abrir pantallas desde fuera de un componente (por ejemplo, desde `TripContext`).                                       |

### `src/components/` — componentes reutilizables

| Archivo                | Responsabilidad                                                                   |
| ---------------------- | --------------------------------------------------------------------------------- |
| `Boton.js`             | Botón con variantes sólido y contorno, estado deshabilitado e indicador de carga. |
| `CampoTexto.js`        | Campo de texto con etiqueta y mensaje de error.                                   |
| `CampoSelect.js`       | Lista desplegable con etiqueta y error.                                           |
| `CampoFecha.js`        | Selector de fecha con etiqueta y error.                                           |
| `CampoFoto.js`         | Selector de foto desde cámara o galería, con vista previa y manejo de permisos.   |
| `CampoCheck.js`        | Casilla de verificación con texto y error.                                        |
| `FormScroll.js`        | Contenedor con scroll, título y subtítulo para los formularios.                   |
| `MapaBase.js`          | Mapa reutilizable: Google Maps si hay clave y, si no, tiles alternos de OpenStreetMap/CARTO con su atribución.   |
| `ScreenPlaceholder.js` | Pantalla provisional con título y subtítulo para secciones aún sin construir.     |

### `src/screens/` — pantallas

| Archivo                             | Responsabilidad                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `registro/DatosPersonalesScreen.js` | Pestaña 1 del registro: foto, nombre, documento, celular, fecha de nacimiento, género, correo e idioma.                                |
| `registro/VehiculoScreen.js`        | Pestaña 2: categoría, placa, marca, modelo, año, color, capacidad y foto del vehículo.                                                 |
| `registro/DocumentosScreen.js`      | Pestaña 3: licencia, SOAT, revisión técnico-mecánica (solo si aplica), correo de Mercado Pago, términos y envío del registro.          |
| `InicioScreen.js`                   | Mapa con la posición del conductor, interruptor Disponible / No disponible, estado de aprobación y guardado periódico de la ubicación. |
| `SolicitudScreen.js`                | Solicitud entrante: cuenta regresiva, origen, destino, tarifa estimada, ganancia neta y botones Aceptar / Rechazar.                    |
| `ConfiguracionScreen.js`            | Cambio de idioma (guardado en AsyncStorage) y cierre de sesión.                                                                        |
| `ViajeEnCursoScreen.js`             | Viaje aceptado: ruta hasta el origen y el destino en el mapa y avance de estados (en camino, pasajero a bordo, finalizar o cancelar). |
| `CobroScreen.js`                    | Resumen del viaje (tarifa, comisión, ganancia). Efectivo: confirma el cobro y descuenta la comisión del saldo. Mercado Pago: abre el pago. |
| `PerfilScreen.js`                   | Datos personales y del vehículo editables, fotos, y datos de solo lectura (documento, placa, vigencia de documentos, saldo). |
| `HistorialScreen.js`                | Lista paginada de viajes con filtros Hoy, Semana, Mes y método de pago; toca un viaje para ver el detalle. |
| `GananciasScreen.js`                | Saldo y resumen de ganancias por día, semana y mes. |
| `DetalleViajeScreen.js`             | Detalle de un viaje del historial, con la ruta dibujada con `Polyline`.                                                  |
| `PagoMercadoPagoScreen.js`          | Checkout de Mercado Pago en un `WebView`; al volver, el backend verifica el pago y se muestra el resultado.              |

## Backend (`backend/`)

| Archivo               | Responsabilidad                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/server.js`       | Servidor Express: `GET /health`, `POST /payments/preference`, `POST /payments/confirm` y `POST /webhooks/mercadopago`; inicia el observador de viajes. |
| `src/firebase.js`     | Inicializa `firebase-admin` con la llave `backend/serviceAccountKey.json`.                                                                       |
| `src/tripWatcher.js`  | Observa los viajes `requested` en Firestore y envía una notificación push al conductor (FCM).                                                    |
| `src/payments.js`     | Crea la preferencia de Checkout Pro, **verifica el pago con la API de Mercado Pago** y solo entonces marca el viaje `paid` y acredita el saldo. |

Los secretos viven en `backend/.env` y `backend/serviceAccountKey.json`, fuera de Git.

## Arquitectura por capas

```
screens / components   →  dibujan la interfaz
context / hooks        →  estado compartido, tiempo real y temporizadores
services               →  Firestore, Cloudinary y AsyncStorage
utils / config         →  lógica pura y constantes
```

Cada capa solo se comunica con la inferior. Si cambia el backend, solo se modifica `services/`; si cambia la comisión, solo `config/pricing.js`.

## Flujo de un viaje

```
requested → accepted → driver_arriving → in_progress → completed → paid
          ↘ rejected (el conductor rechaza o se agotan los 15 s)
          ↘ cancelled
```

Como no existe la app del pasajero, en modo desarrollo la pantalla Inicio tiene dos botones de prueba, **Simular solicitud en efectivo** y **Simular solicitud Mercado Pago**, que crean un viaje. El backend detecta la solicitud y envía la notificación push.

Al finalizar el viaje se calcula la tarifa y se pasa a `completed`. Si el pago es **en efectivo**, el conductor confirma el cobro y la comisión se descuenta de su saldo. Si es con **Mercado Pago**, el backend verifica el pago y suma la ganancia neta al saldo.

## Cálculo de tarifa

```
tarifa = max(mínima, redondear_100((base + km · precioKm + min · precioMin) · multiplicador))
comisión = tarifa · 20 %
ganancia del conductor = tarifa − comisión + propina
```

Ejemplo (8,5 km, 22 min, categoría Económico): tarifa $19.200, comisión $3.840, ganancia $15.360.

## Modelo de datos (Firestore)

- **`drivers`**: `personal`, `vehicle`, `documents`, `acceptedCommissionRate`, `status` (`pending` → `approved`), `isAvailable`, `balance`, `location`, `locationUpdatedAt`, `fcmToken`, `fcmTokenUpdatedAt`, `createdAt`.
- **`trips`**: `driverId`, `passengerId`, `origin`, `destination`, `distanceKm`, `durationMin`, `category`, `paymentMethod`, `commissionRate`, `tip`, `status`, `fare`, `commission`, `driverEarnings`, `polyline`, `paymentStatus`, `paymentId`, `preferenceId`, `createdAt`, `completedAt`, `paidAt`.

El historial consulta `trips` por `driverId` ordenado por `createdAt`, lo que requiere un **índice compuesto** (Firestore muestra un enlace para crearlo la primera vez).

## Estado del proyecto

**Implementado:** registro con validaciones y fotos, sesión persistente, aprobación en tiempo real, mapa y ubicación, solicitudes con temporizador y notificación push (FCM), aceptar/rechazar con transacción, viaje en curso con ruta, cobro en efectivo y con Mercado Pago (modo de prueba), historial con filtros y detalle, ganancias, perfil editable, configuración y backend Express.

**Pendiente:** cambio real de idioma, filtro de historial por rango de fechas y reglas de seguridad de Firestore.

## Uso de IA

El uso de herramientas de IA está registrado en [`docs/AI_LOG.md`](docs/AI_LOG.md) (una entrada por cada uso: objetivo, prompt, resumen, qué se usó o descartó, archivos, verificación y aprendizaje). Los archivos asistidos lo indican con un comentario al inicio (por ejemplo, `AI-assisted: see docs/AI_LOG.md #6`).

| Entradas | Integrante      | Tema                                                                                          |
| -------- | --------------- | --------------------------------------------------------------------------------------------- |
| #1 a #8  | Paula Rosero    | Tarifa, navegación, registro, sesión, solicitudes, mapa, viaje en curso y cobro en efectivo   |
| #9, #10  | Miguel Montenegro | Ganancias y menú lateral                                                                    |
| #11      | Paula Rosero    | Corrección del historial                                                                      |
| #12      | Paula Rosero    | Perfil                                                                                        |
| #13      | Paula Rosero    | Notificaciones FCM                                                                            |
| #14      | Paula Rosero    | Backend y Mercado Pago                                                                        |

Todo el código generado con ayuda de IA fue leído, probado y adaptado por el equipo antes de incluirse.

## Autores

Miguel Montenegro
Paula Rosero
