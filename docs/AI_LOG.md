# Bitácora de uso de IA

### Entrada #1

- Fecha: 2026-10-25
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Crear pricing.js y calculateFare con comisión configurable
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Función pura que aplica tarifa base, km, minuto, multiplicador, redondeo a 100 y comisión del 20 %.
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: src/config/pricing.js, src/utils/calculateFare.js — (hash del commit)
- Verificación: Probado con el ejemplo de 8,5 km y 22 min (sección 5 del PDF), Económico y XL.
- Aprendizaje: (completar con tus palabras)

### Entrada #2

- Fecha: 2026-10-30
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Crear tema, configuración de Firebase y navegación base (Stack, Tabs y Drawer) con pantallas vacías
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Archivos de tema, firebase.js leyendo variables del .env y tres navegadores con pantallas de relleno.
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: App.js, index.js, src/theme, src/config/firebase.js, src/navigation/_, src/screens/_ — (hash del commit)
- Verificación: (completar: app abre en el emulador y se navega entre pantallas)
- Aprendizaje: (completar con tus palabras)

### Entrada #3

- Fecha: 2026-11-01
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Crear el registro del conductor en 3 pestañas con validaciones, errores bajo cada campo y envío con estado "pendiente"
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Validadores puros, contexto del formulario, componentes de campo (texto, lista, fecha, foto, checkbox), tres pantallas y guardado en Firestore con status "pending".
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: src/utils/validators.js, src/utils/format.js, src/context/RegistroContext.js, src/services/_, src/components/Campo_.js, src/screens/registro/\*, src/navigation/RegistroTabs.js — (hash del commit)
- Verificación: (completar: prueba en el emulador con datos válidos e inválidos; documento creado en Firestore)
- Aprendizaje: (completar con tus palabras)

### Entrada #4

- Fecha: 2026-11-01
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Subir las fotos a Cloudinary y crear la sesión del conductor (AsyncStorage + escucha en tiempo real del estado de aprobación)
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Servicio de imágenes con preset sin firma, servicio de sesión, DriverContext con onSnapshot y limpieza, navegación inicial según sesión, pantalla Inicio con estado/disponibilidad y cierre de sesión.
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: src/services/imageService.js, sessionService.js, driverService.js, src/context/DriverContext.js, App.js, RootNavigator.js, InicioScreen.js, ConfiguracionScreen.js — (hash del commit)
- Verificación: (completar: registro con fotos reales, cambiar status a "approved" en Firestore y ver el interruptor Disponible)
- Aprendizaje: (completar con tus palabras)

### Entrada #5

- Fecha: 2026-11-01
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Pantalla Inicio con mapa y hook personalizado useDriverLocation (geolocalización del dispositivo)
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Hook con permiso de ubicación, watchPosition y limpieza con clearWatch; mapa de Google con marcador; guardado de la posición en Firestore solo cuando está Disponible (cada 15 s); app.config.js que inyecta la clave de Maps desde .env.
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: src/hooks/useDriverLocation.js, src/screens/InicioScreen.js, src/services/driverService.js, app.config.js — (hash del commit)
- Verificación: (completar: ubicación simulada en el emulador, marcador en el mapa, posición guardada en Firestore)
- Aprendizaje: (completar con tus palabras)

### Entrada #6

- Fecha: 2026-11-02
- Integrante: Paula Rosero
- Herramienta: Claude
- Objetivo: Solicitud entrante con temporizador de 15 s (hook useTripRequests), contexto del viaje activo, y ajustes del seguimiento de ubicación y de las preferencias
- Prompt: (pegar aquí el prompt tal como lo escribiste)
- Resumen de la respuesta: Servicio de viajes con transacciones, hook con suscripción en tiempo real y cuenta regresiva con limpieza, contexto que abre la pantalla de solicitud, pantalla con tarifa y ganancia estimadas, seguimiento que se detiene en "No disponible", preferencias en AsyncStorage.
- Qué se usó / modificó / descartó: (completar)
- Archivos y commit: src/hooks/useTripRequests.js, src/hooks/useDriverLocation.js, src/services/tripService.js, src/services/preferencesService.js, src/context/TripContext.js, src/screens/SolicitudScreen.js, src/screens/InicioScreen.js, src/config/trips.js — (hash del commit)
- Verificación: (completar: botón "Simular solicitud", temporizador, aceptar y rechazar, documento en la colección trips)
- Aprendizaje: (completar con tus palabras)

### Entrada #7
- Fecha: 2026-11-08
- Integrante: Miguel Montenegro
- Herramienta: Claude
- Objetivo: Configurar Babel para Reanimated 4 (plugin de worklets) y envolver la app en GestureHandlerRootView para que el Drawer funcione.
- Prompt: Actúa como arquitecto de software senior y mentor en React Native/Expo. Estoy finalizando el proyecto UberClone Driver según el PDF adjunto. Necesito configurar Babel para que funcione Reanimated 4 con react-native-worklets y envolver la app en GestureHandlerRootView para que funcione el Drawer del menú principal. Mi babel.config.js actual solo tiene babel-preset-expo. Mi App.js está en la raíz y envuelve la app con SafeAreaProvider, DriverProvider, RegistroProvider, TripProvider y NavigationContainer. Entrégame los archivos completos con la ruta exacta, explícame por qué es necesario cada cambio, dame los comandos para limpiar la caché de Metro y dime cómo probar que el Drawer funciona sin errores
- Resumen de la respuesta: Se añadió react-native-worklets/plugin como último plugin en babel.config.js. Se envolvió el árbol de providers y navegación de App.js con GestureHandlerRootView (importado desde react-native-gesture-handler).
- Qué se usó / modificó / descartó: Se usó la configuración de Babel y el wrapper de GestureHandlerRootView. Se descartó copiar GestureHandlerRootView.tsx a la raíz del proyecto, porque es código interno del paquete, no un archivo del proyecto.
- Archivos y commit: babel.config.js, App.js — (hash del commit)
- Verificación: Rebuild de Android con npx expo run:android. La app arrancó sin el error de @react-native-community/geolocation. El Drawer abre con Inicio, Perfil, Historial, Ganancias y Configuración. La consola de Metro no muestra errores de Reanimated ni de GestureHandlerRootView.
- Aprendizaje: Entendí que Reanimated 4 movió su plugin al paquete react-native-worklets y que, sin él, las animaciones y el Drawer fallan en runtime sin avisar durante el bundle. También aprendí que cualquier módulo nativo nuevo requiere rebuild del development build con expo run:android; recargar Metro no basta. En adelante, cada vez que agregue un paquete nativo, haré el rebuild antes de probar la funcionalidad.

### Entrada #8
- Fecha: 2026-11-08
- Integrante: Miguel Montenegro
- Herramienta: Claude
- Objetivo: Corregir CampoFecha para que use la API oficial de @react-native-community/datetimepicker@9.1.0.
- Prompt: Actúa como arquitecto de software senior y mentor en React Native/Expo. Mi componente CampoFecha.js usa las props onValueChange y onDismiss en @react-native-community/datetimepicker@9.1.0, pero las fechas no se guardan y el picker no se cierra. Corrige el componente según la API oficial del paquete, manteniendo la firma onChange(date) que usan los formularios DatosPersonalesScreen y DocumentosScreen para no tocarlos. Explícame qué cambia, por qué, y cómo probarlo en Android e iOS considerando que solo tengo entorno Android en Windows.
- Resumen de la respuesta: Se reemplazaron onValueChange/onDismiss (props inexistentes) por onChange(event, selectedDate). En Android el picker cierra solo, así que basta con limpiar open dentro de onChange. En iOS el picker es inline, así que se agregaron botones Aceptar/Cancelar con un draft interno.
Qué se usó / modificó / descartó: Se usó onChange, event.type === 'set' y Platform.OS. Se descartaron onValueChange y onDismiss.
Archivos y commit: src/components/CampoFecha.js — (hash del commit)
Verificación: En Android, elegir fecha de nacimiento, validación de mayoría de edad, y elegir los tres vencimientos en Documentos. El campo muestra la fecha elegida y los errores por campo aparecen correctamente. La consola no muestra warnings del DateTimePicker.
Aprendizaje: Entendí que DateTimePicker@9 no usa onValueChange ni onDismiss: la API es onChange(event, date), y event.type dice si el usuario eligió (set) o canceló (dismissed). En Android el picker es modal y se cierra solo; en iOS es inline y necesita un draft con Aceptar/Cancelar para no confirmar en cada movimiento del spinner. Lo aplicaré a cualquier componente que envuelva APIs nativas con comportamiento distinto por plataforma
