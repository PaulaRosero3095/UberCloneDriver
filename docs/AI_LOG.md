Bitácora de uso de IA
Entrada #1
Fecha: 2026-10-25
Integrante: Paula Rosero
Herramienta: Claude
Objetivo: Crear pricing.js y calculateFare con comisión configurable
Prompt: (pegar aquí el prompt tal como lo escribiste)
Resumen de la respuesta: Función pura que aplica tarifa base, km, minuto, multiplicador, redondeo a 100 y comisión del 20 %.
Qué se usó / modificó / descartó: (completar)
Archivos y commit: src/config/pricing.js, src/utils/calculateFare.js — (hash del commit)
Verificación: Probado con el ejemplo de 8,5 km y 22 min (sección 5 del PDF), Económico y XL.
Aprendizaje: (completar con tus palabras)
Entrada #2
Fecha: 2026-10-30
Integrante: Paula Rosero
Herramienta: Claude
Objetivo: Crear tema, configuración de Firebase y navegación base (Stack, Tabs y Drawer) con pantallas vacías
Prompt: (pegar aquí el prompt tal como lo escribiste)
Resumen de la respuesta: Archivos de tema, firebase.js leyendo variables del .env y tres navegadores con pantallas de relleno.
Qué se usó / modificó / descartó: (completar)
Archivos y commit: App.js, index.js, src/theme, src/config/firebase.js, src/navigation/, src/screens/ — (hash del commit)
Verificación: (completar: app abre en el emulador y se navega entre pantallas)
Aprendizaje: (completar con tus palabras)
Entrada #3
Fecha: 2026-11-01
Integrante: Paula Rosero
Herramienta: Claude
Objetivo: Crear el registro del conductor en 3 pestañas con validaciones, errores bajo cada campo y envío con estado "pendiente"
Prompt: (pegar aquí el prompt tal como lo escribiste)
Resumen de la respuesta: Validadores puros, contexto del formulario, componentes de campo (texto, lista, fecha, foto, checkbox), tres pantallas y guardado en Firestore con status "pending".
Qué se usó / modificó / descartó: (completar)
Archivos y commit: src/utils/validators.js, src/utils/format.js, src/context/RegistroContext.js, src/services/, src/components/Campo.js, src/screens/registro/\*, src/navigation/RegistroTabs.js — (hash del commit)
Verificación: (completar: prueba en el emulador con datos válidos e inválidos; documento creado en Firestore)
Aprendizaje: (completar con tus palabras)
Entrada #4
Fecha: 2026-11-01
Integrante: Paula Rosero
Herramienta: Claude
Objetivo: Subir las fotos a Cloudinary y crear la sesión del conductor (AsyncStorage + escucha en tiempo real del estado de aprobación)
Prompt: (pegar aquí el prompt tal como lo escribiste)
Resumen de la respuesta: Servicio de imágenes con preset sin firma, servicio de sesión, DriverContext con onSnapshot y limpieza, navegación inicial según sesión, pantalla Inicio con estado/disponibilidad y cierre de sesión.
Qué se usó / modificó / descartó: (completar)
Archivos y commit: src/services/imageService.js, sessionService.js, driverService.js, src/context/DriverContext.js, App.js, RootNavigator.js, InicioScreen.js, ConfiguracionScreen.js — (hash del commit)
Verificación: (completar: registro con fotos reales, cambiar status a "approved" en Firestore y ver el interruptor Disponible)
Aprendizaje: (completar con tus palabras)
Entrada #5
Fecha: 2026-11-01
Integrante: Paula Rosero
Herramienta: Claude
Objetivo: Pantalla Inicio con mapa y hook personalizado useDriverLocation (geolocalización del dispositivo)
Prompt: (pegar aquí el prompt tal como lo escribiste)
Resumen de la respuesta: Hook con permiso de ubicación, watchPosition y limpieza con clearWatch; mapa de Google con marcador; guardado de la posición en Firestore solo cuando está Disponible (cada 15 s); app.config.js que inyecta la clave de Maps desde .env.
Qué se usó / modificó / descartó: (completar)
Archivos y commit: src/hooks/useDriverLocation.js, src/screens/InicioScreen.js, src/services/driverService.js, app.config.js — (hash del commit)
Verificación: (completar: ubicación simulada en el emulador, marcador en el mapa, posición guardada en Firestore)
Aprendizaje: (completar con tus palabras)
