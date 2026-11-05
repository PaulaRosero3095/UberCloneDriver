# UberClone Conductor

Proyecto final: clon del perfil de **conductor** de Uber, hecho con **React Native + Expo**.

Qué permite hacer la app:

1. **Registrarse** como conductor en 3 pestañas (datos personales, vehículo y documentos), con validaciones y subida de fotos.
2. Quedar en estado **pendiente de aprobación** hasta que se cambie a `approved` en la base de datos.
3. Ponerse **Disponible**, ver su ubicación en un **mapa** y guardarla en Firestore.
4. **Recibir solicitudes de viaje** en tiempo real con un temporizador de 15 s, ver la tarifa y ganancia estimadas, y **aceptar o rechazar**.
5. Conservar la **sesión** y las **preferencias** al cerrar la app (AsyncStorage).

## Tecnologías

| Capa                   | Tecnología                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Framework              | React Native + Expo (development build con `expo-dev-client`)                                |
| Navegación             | React Navigation (Stack, Bottom Tabs y Drawer)                                               |
| Estado global          | Context API (`DriverContext`, `RegistroContext`, `TripContext`)                              |
| Base de datos          | Firebase Firestore (SDK `firebase`, escuchas en tiempo real con `onSnapshot`)                |
| Imágenes               | Cloudinary (preset sin firma)                                                                |
| Mapas y ubicación      | `react-native-maps` y `@react-native-community/geolocation`                                  |
| Almacenamiento local   | `@react-native-async-storage/async-storage`                                                  |
| Fotos, fechas y listas | `expo-image-picker`, `@react-native-community/datetimepicker`, `@react-native-picker/picker` |

## Requisitos

- Node.js y npm
- Android Studio (emulador) o un teléfono Android
- Un proyecto de Firebase con Firestore activado
- Una cuenta de Cloudinary con un _upload preset_ **sin firma**
- (Opcional) Una clave de Google Maps. Sin clave, la app dibuja el mapa con tiles de OpenStreetMap/CARTO.

## Instalación y ejecución

```bash
npm install
cp .env.example .env      # y completa los valores
npx expo run:android      # genera y abre la development build
npx expo start            # servidor de desarrollo
```

> La app usa módulos con código nativo, por eso **no funciona en Expo Go**: requiere development build.
> Coloca tu archivo `google-services.json` en la raíz (está en `.gitignore`, no se sube a GitHub).

### Variables de entorno (`.env`)

| Variable                               | Para qué sirve                       |
| -------------------------------------- | ------------------------------------ |
| `EXPO_PUBLIC_FIREBASE_API_KEY`         | Clave de la app web de Firebase      |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`     | Dominio de autenticación de Firebase |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`      | ID del proyecto de Firebase          |
| `EXPO_PUBLIC_FIREBASE_APP_ID`          | ID de la app de Firebase             |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`      | Clave de Google Maps (opcional)      |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Nombre de la nube de Cloudinary      |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset de subida sin firma           |

El archivo `.env` nunca se sube al repositorio; `.env.example` es la plantilla.

## Árbol de carpetas

```
UberCloneDriver/
├── .claude/
│   └── settings.json
├── assets/
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
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
│   │   └── ScreenPlaceholder.js
│   ├── config/
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
│   │   └── useTripRequests.js
│   ├── navigation/
│   │   ├── DrawerNavigator.js
│   │   ├── RegistroTabs.js
│   │   ├── RootNavigator.js
│   │   └── navigationRef.js
│   ├── screens/
│   │   ├── registro/
│   │   │   ├── DatosPersonalesScreen.js
│   │   │   ├── DocumentosScreen.js
│   │   │   └── VehiculoScreen.js
│   │   ├── CobroScreen.js
│   │   ├── ConfiguracionScreen.js
│   │   ├── GananciasScreen.js
│   │   ├── HistorialScreen.js
│   │   ├── InicioScreen.js
│   │   ├── PerfilScreen.js
│   │   ├── SolicitudScreen.js
│   │   └── ViajeEnCursoScreen.js
│   ├── services/
│   │   ├── driverService.js
│   │   ├── imageService.js
│   │   ├── preferencesService.js
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
├── AGENTS.md
├── App.js
├── LICENSE
├── README.md
├── app.config.js
├── app.json
├── autolink.json
├── index.js
├── package-lock.json
└── package.json
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
| `AGENTS.md`                          | Guía de buenas prácticas de Expo para asistentes de IA que trabajen en el repositorio.                                                                     |
| `autolink.json`                      | Archivo generado automáticamente por Expo para enlazar módulos nativos. No se edita a mano.                                                                |
| `LICENSE`                            | Licencia del proyecto.                                                                                                                                     |
| `README.md`                          | Este documento.                                                                                                                                            |
| `.claude/settings.json`              | Configuración local de la herramienta de IA (plugin de Expo habilitado).                                                                                   |
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
| `driverService.js`      | Registra al conductor en Firestore (sube las 5 fotos en paralelo, estado `pending`), escucha su documento en tiempo real, cambia su disponibilidad y guarda su última ubicación. |
| `tripService.js`        | Escucha solicitudes y el viaje activo en tiempo real, acepta o rechaza con transacción (solo si sigue en `requested`) y crea un viaje de prueba.                                 |
| `imageService.js`       | Sube una imagen a Cloudinary con preset sin firma usando `XMLHttpRequest` y devuelve su URL pública.                                                                             |
| `sessionService.js`     | Guarda, lee y borra el `driverId` de la sesión en AsyncStorage.                                                                                                                  |
| `preferencesService.js` | Guarda y lee preferencias (idioma, última disponibilidad) en AsyncStorage con prefijo `pref:`.                                                                                   |

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

### `src/navigation/`

| Archivo              | Responsabilidad                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RootNavigator.js`   | Stack principal: Registro, Main, Solicitud, ViajeEnCurso y Cobro. Elige la ruta inicial según haya sesión y muestra un spinner mientras se restaura. |
| `RegistroTabs.js`    | Tabs del registro (Datos personales, Vehículo, Documentos) con íconos y una marca "!" cuando hay errores visibles.                                   |
| `DrawerNavigator.js` | Menú lateral: Inicio, Perfil, Historial, Ganancias y Configuración.                                                                                  |
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
| `ViajeEnCursoScreen.js`             | Muestra el estado del viaje aceptado (en construcción).                                                                                |
| `CobroScreen.js`                    | Cobro y resumen del viaje (pendiente).                                                                                                 |
| `PerfilScreen.js`                   | Perfil del conductor (pendiente).                                                                                                      |
| `HistorialScreen.js`                | Historial de carreras (pendiente).                                                                                                     |
| `GananciasScreen.js`                | Ganancias por día, semana y mes (pendiente).                                                                                           |

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

Hoy la app cubre hasta `accepted`. Como no existe la app del pasajero, en modo desarrollo el botón **"Simular solicitud"** de la pantalla Inicio crea un viaje de prueba.

## Cálculo de tarifa

```
tarifa = max(mínima, redondear_100((base + km · precioKm + min · precioMin) · multiplicador))
comisión = tarifa · 20 %
ganancia del conductor = tarifa − comisión + propina
```

Ejemplo (8,5 km, 22 min, categoría Económico): tarifa $19.200, comisión $3.840, ganancia $15.360.

## Modelo de datos (Firestore)

- **`drivers`**: `personal`, `vehicle`, `documents`, `acceptedCommissionRate`, `status` (`pending` → `approved`), `isAvailable`, `balance`, `location`, `locationUpdatedAt`, `createdAt`.
- **`trips`**: `driverId`, `passengerId`, `origin`, `destination`, `distanceKm`, `durationMin`, `category`, `paymentMethod`, `commissionRate`, `tip`, `status`, `createdAt`.

## Estado del proyecto

**Implementado:** registro con validaciones y fotos, sesión persistente, aprobación en tiempo real, mapa y ubicación, solicitudes con temporizador, aceptar/rechazar con transacción, cálculo de tarifa y configuración básica.

**Pendiente:** viaje en curso, cobro, perfil, historial, ganancias, notificaciones push, pasarelas de pago y cambio real de idioma.

## Uso de IA

El uso de herramientas de IA está registrado en [`docs/AI_LOG.md`](docs/AI_LOG.md). Los archivos asistidos lo indican en un comentario al inicio (por ejemplo, `AI-assisted: see docs/AI_LOG.md #6`).

## Autora

Miguel Montenegro
Paula Rosero
