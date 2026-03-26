# Requerimientos de Poorty Goblin Web

## 1. Propósito del documento

El presente documento define los requerimientos funcionales y no funcionales de **Poorty Goblin Web**, con el propósito de establecer de forma clara, verificable y estructurada qué debe ofrecer el sistema, cómo debe comportarse y bajo qué condiciones mínimas de calidad debe desarrollarse su primera versión.

A diferencia de la documentación general del proyecto, que describe la solución desde una perspectiva amplia, conceptual y arquitectónica, este documento se centra en traducir esa visión a una especificación más operativa. Su finalidad es servir como base para:

* orientar el diseño detallado del sistema;
* delimitar el alcance real de la primera versión;
* organizar la implementación por módulos;
* derivar criterios de aceptación;
* apoyar procesos de validación, prueba y revisión;
* y facilitar la evolución futura del proyecto sobre una base consistente.

Este documento se redacta como especificación de proyecto. Por ello, los requerimientos se expresan como capacidades y condiciones que el sistema **debe cumplir**, sin depender de que cada una de ellas se encuentre completamente implementada al momento de redactarlos. No obstante, su formulación se encuentra alineada con la dirección real de Poorty Goblin Web como producto: una plataforma web multijugador, de tablero y por turnos, con autenticación, lobbies, sincronización en tiempo real, casillas especiales, minijuegos integrados y una arquitectura modular preparada para profesionalización progresiva.

---

## 2. Alcance del documento

Este documento cubre los requerimientos asociados a las capacidades fundamentales de la primera versión de Poorty Goblin Web. En términos generales, comprende:

* requerimientos funcionales de autenticación e identidad de usuario;
* requerimientos funcionales de navegación principal;
* requerimientos funcionales de creación, gestión e ingreso a salas;
* requerimientos funcionales del lobby y de las fases previas a la partida;
* requerimientos funcionales del tablero, turnos, casillas y resolución de eventos;
* requerimientos funcionales de minijuegos y su integración con el avance;
* requerimientos funcionales de chat y sincronización en tiempo real;
* requerimientos funcionales de persistencia y cierre de partida;
* requerimientos no funcionales de usabilidad, rendimiento, seguridad, mantenibilidad, despliegue y calidad general del software;
* lineamientos estructurales del modelo de datos inicial.

El documento no sustituye especificaciones de bajo nivel, diagramas técnicos detallados, manuales de despliegue ni documentación de APIs particulares. Su función es establecer la base formal desde la que posteriormente puedan derivarse decisiones de diseño técnico, tareas de implementación y pruebas de aceptación.

---

## 3. Contexto general del sistema

Poorty Goblin Web es una plataforma de juego multijugador en línea en la que entre **dos y seis jugadores** participan dentro de una misma partida compartida. Cada usuario interactúa desde su propia sesión, pero todos deben compartir una única versión válida del estado del juego.

La experiencia del sistema se organiza alrededor de las siguientes capas:

1. acceso autenticado a la plataforma;
2. creación o ingreso a salas;
3. permanencia en lobby previo al inicio;
4. definición del orden de participación;
5. selección de personaje;
6. desarrollo de la partida sobre un tablero compartido;
7. resolución de casillas y minijuegos;
8. comunicación entre participantes;
9. identificación del ganador y cierre formal de la sesión.

Desde el punto de vista del diseño funcional, el sistema debe comportarse de acuerdo con los siguientes principios generales:

* el cliente no debe decidir resultados críticos de la partida;
* la lógica principal debe resolverse de forma centralizada;
* el tablero debe funcionar como un sistema de eventos encadenables;
* los minijuegos deben tener impacto real en el avance;
* y la arquitectura debe favorecer crecimiento futuro sin exigir reconstrucción completa.

---

## 4. Convenciones de lectura

Para facilitar la interpretación del documento, se utilizarán las siguientes convenciones:

* **RF**: Requerimiento funcional.
* **RNF**: Requerimiento no funcional.
* **debe**: expresa una condición obligatoria del sistema.
* **puede**: expresa una capacidad opcional, ampliable o sujeta al alcance elegido.
* **versión 1**: se refiere a la primera versión jugable, coherente y defendible del sistema, no a una versión final ni exhaustiva.

Los requerimientos se agrupan por módulo o por área funcional para mantener coherencia entre diseño del sistema y lectura del documento.

---

# 5. Requerimientos funcionales

Los requerimientos funcionales describen las capacidades concretas que el sistema debe proporcionar. En conjunto, definen el comportamiento observable esperado de Poorty Goblin Web como plataforma de juego multijugador web.

---

## 5.1 Requerimientos funcionales de acceso, autenticación e identidad

### 5.1.1 Registro de usuario

**RF-01.** El sistema debe permitir que un usuario cree una cuenta nueva dentro de la plataforma.

**RF-02.** Durante el registro, el sistema debe solicitar como mínimo un correo electrónico válido, una contraseña y un nombre de usuario.

**RF-03.** El sistema debe validar que el correo electrónico no se encuentre previamente registrado.

**RF-04.** El sistema debe validar que el nombre de usuario no se encuentre previamente registrado.

**RF-05.** El sistema debe impedir la creación de cuentas con datos obligatorios incompletos o inválidos.

### 5.1.2 Inicio de sesión

**RF-06.** El sistema debe permitir que el usuario inicie sesión mediante credenciales válidas.

**RF-07.** El sistema debe permitir, según la política funcional definida, que el identificador de acceso sea correo electrónico o nombre de usuario.

**RF-08.** El sistema debe validar las credenciales antes de conceder acceso a la plataforma.

**RF-09.** Si las credenciales son inválidas, el sistema debe informar el error de forma clara y comprensible.

### 5.1.3 Gestión de sesión

**RF-10.** El sistema debe mantener una sesión activa para el usuario autenticado conforme a la política definida por la aplicación.

**RF-11.** El sistema debe impedir el acceso a módulos protegidos cuando el usuario no haya iniciado sesión.

**RF-12.** El sistema debe permitir que el usuario cierre sesión de manera explícita.

### 5.1.4 Recuperación de acceso

**RF-13.** El sistema debe contemplar un flujo de recuperación o restablecimiento de contraseña cuando esta funcionalidad forme parte del alcance de la versión.

**RF-14.** Si existe recuperación de acceso, el sistema debe asegurar que el flujo de restablecimiento esté vinculado a un mecanismo seguro y verificable.

### 5.1.5 Perfil funcional del usuario

**RF-15.** El sistema debe asociar la identidad autenticada del usuario con un perfil utilizable por los distintos módulos del producto.

**RF-16.** El sistema debe mantener información básica del usuario para su representación dentro de salas, partidas, chat y módulos sociales cuando corresponda.

---

## 5.2 Requerimientos funcionales de navegación principal

**RF-17.** El sistema debe mostrar una pantalla principal al usuario después de iniciar sesión correctamente.

**RF-18.** La pantalla principal debe ofrecer como mínimo acceso a la creación de partida y a la unión a partida.

**RF-19.** El sistema debe permitir la navegación hacia otras secciones habilitadas de la plataforma, tales como perfil, ayuda, soporte o equivalentes según el alcance de la versión.

**RF-20.** La navegación entre módulos principales debe mantenerse coherente a lo largo del sistema.

**RF-21.** El sistema debe permitir que el usuario identifique claramente desde la interfaz en qué pantalla o módulo se encuentra.

---

## 5.3 Requerimientos funcionales de creación e ingreso a salas

### 5.3.1 Creación de sala

**RF-22.** El sistema debe permitir que un usuario cree una nueva sala o partida en estado de lobby.

**RF-23.** Al crear la sala, el sistema debe permitir definir si esta será pública o privada.

**RF-24.** El sistema debe registrar al usuario creador como administrador de la sala.

**RF-25.** El sistema debe asociar la sala creada al usuario que la generó.

**RF-26.** El sistema debe inicializar la sala con un estado adecuado para aceptar jugadores mientras no haya iniciado formalmente.

### 5.3.2 Salas privadas

**RF-27.** Si la sala se define como privada, el sistema debe generar automáticamente un código único de acceso.

**RF-28.** El código de acceso de una sala privada debe ser lo suficientemente claro para ser compartido entre usuarios.

**RF-29.** El sistema debe validar el código ingresado antes de permitir el acceso a la sala privada correspondiente.

### 5.3.3 Salas públicas

**RF-30.** El sistema debe permitir consultar una lista de salas públicas disponibles.

**RF-31.** Para cada sala pública visible, el sistema debe mostrar información mínima relevante, como cantidad de jugadores actual y estado general.

### 5.3.4 Unión a salas

**RF-32.** El sistema debe permitir unirse a una sala pública seleccionándola desde la lista correspondiente.

**RF-33.** El sistema debe permitir unirse a una sala privada ingresando manualmente un código válido.

**RF-34.** Antes de autorizar el ingreso, el sistema debe validar que la sala exista.

**RF-35.** Antes de autorizar el ingreso, el sistema debe validar que la sala no haya iniciado.

**RF-36.** Antes de autorizar el ingreso, el sistema debe validar que la sala no se encuentre llena.

**RF-37.** Antes de autorizar el ingreso, el sistema debe validar que la sala no se encuentre cerrada o cancelada.

**RF-38.** Si alguna validación falla, el sistema debe comunicar de forma clara el motivo del rechazo.

### 5.3.5 Restricciones de participación simultánea

**RF-39.** El sistema debe impedir que un usuario participe simultáneamente en más de una sala activa si la lógica de negocio final así lo establece.

**RF-40.** El sistema debe impedir que un usuario cree una nueva sala si ya se encuentra vinculado a otra sala activa incompatible.

---

## 5.4 Requerimientos funcionales del lobby

### 5.4.1 Composición del lobby

**RF-41.** Cada lobby debe admitir un mínimo de **2 jugadores** y un máximo de **6 jugadores**.

**RF-42.** El sistema debe mostrar dentro del lobby la lista de jugadores actualmente asociados a la sala.

**RF-43.** El sistema debe indicar claramente cuál usuario cumple el rol de administrador de la sala.

**RF-44.** El sistema debe mostrar la capacidad actual de la sala en relación con su límite máximo.

### 5.4.2 Gestión del lobby

**RF-45.** Solo el administrador de la sala debe poder iniciar la partida.

**RF-46.** El sistema debe impedir que la partida se inicie si no se cumple el mínimo de jugadores requerido.

**RF-47.** El sistema debe permitir que un jugador abandone el lobby antes de iniciado el juego.

**RF-48.** El sistema debe permitir que el administrador cierre o cancele el lobby antes del inicio, cuando dicha capacidad forme parte del alcance funcional final.

**RF-49.** El sistema debe reflejar en tiempo real la entrada y salida de jugadores dentro del lobby.

### 5.4.3 Transición al juego

**RF-50.** Cuando el administrador inicie la partida, el sistema debe cerrar el ingreso de nuevos jugadores y cambiar el estado general de la sesión de forma consistente para todos los participantes.

---

## 5.5 Requerimientos funcionales de preparación de partida

La preparación de partida comprende aquellas fases que ocurren entre el lobby y el comienzo formal del tablero.

### 5.5.1 Definición de orden de participación

**RF-51.** El sistema debe activar una fase de definición de orden cuando la partida sea iniciada.

**RF-52.** El sistema debe permitir que cada jugador realice la acción correspondiente dentro de esa fase según la mecánica definida.

**RF-53.** El sistema debe registrar la participación de cada jugador en esta etapa.

**RF-54.** El sistema debe calcular el orden de participación conforme a la regla oficial del juego.

**RF-55.** El sistema debe comunicar a todos los jugadores el orden resultante.

### 5.5.2 Selección de personaje

**RF-56.** Después de definir el orden, el sistema debe habilitar la fase de selección de personaje.

**RF-57.** El sistema debe permitir la selección de personaje siguiendo la secuencia oficial de participación.

**RF-58.** El sistema debe impedir que un personaje ya seleccionado por un jugador pueda ser elegido nuevamente dentro de la misma partida.

**RF-59.** El sistema debe actualizar para todos los jugadores el estado de disponibilidad de personajes conforme se realicen las selecciones.

**RF-60.** La fase de selección de personaje solo debe concluir cuando todos los jugadores hayan quedado asociados a una opción válida o cuando el sistema resuelva automáticamente los casos pendientes según la lógica configurada.

### 5.5.3 Temporizadores y resolución automática

**RF-61.** Si la versión contempla temporizadores en fases preparatorias, el sistema debe gestionarlos de forma centralizada.

**RF-62.** Los temporizadores de una misma fase deben ser consistentes para todos los jugadores conectados.

**RF-63.** Si un jugador no resuelve una acción preparatoria dentro del tiempo establecido, el sistema debe aplicar la regla de resolución automática definida para dicha fase.

---

## 5.6 Requerimientos funcionales del tablero principal

### 5.6.1 Inicio del tablero

**RF-64.** Una vez completadas las fases de preparación, el sistema debe crear la sesión formal de partida.

**RF-65.** El sistema debe mostrar el tablero principal a todos los jugadores participantes.

**RF-66.** El sistema debe ubicar a todos los jugadores en la posición inicial del recorrido.

**RF-67.** El sistema debe asociar una ficha a cada jugador de acuerdo con el personaje seleccionado.

### 5.6.2 Turnos

**RF-68.** El sistema debe mantener un turno activo único dentro de la partida.

**RF-69.** El sistema debe indicar visualmente cuál jugador tiene el turno activo.

**RF-70.** El sistema debe permitir que solo el jugador en turno ejecute acciones de tablero.

**RF-71.** El sistema debe impedir que jugadores fuera de turno ejecuten acciones equivalentes al lanzamiento o resolución principal del tablero.

### 5.6.3 Lanzamiento y movimiento

**RF-72.** El sistema debe permitir lanzar el dado únicamente cuando la lógica del turno lo autorice.

**RF-73.** El resultado del dado debe ser determinado por el sistema y no por el cliente.

**RF-74.** El sistema debe calcular el desplazamiento correspondiente conforme al resultado del dado y a los estados activos del jugador.

**RF-75.** El sistema debe mover visualmente la ficha del jugador a través del tablero según el desplazamiento válido.

**RF-76.** El sistema debe reflejar el movimiento del jugador para todos los participantes de la partida.

### 5.6.4 Meta y victoria

**RF-77.** El sistema debe identificar si el jugador llegó a la meta tras la resolución de su movimiento.

**RF-78.** Si el valor del desplazamiento excede la meta, el sistema debe aplicar la regla de retroceso según el excedente.

**RF-79.** El sistema no debe declarar victoria hasta que se cumpla la regla válida de llegada final.

---

## 5.7 Requerimientos funcionales de resolución de turno y encadenamiento

### 5.7.1 Secuencia general de resolución

**RF-80.** El sistema debe resolver cada turno siguiendo una secuencia coherente entre validación, movimiento visible y efectos.

**RF-81.** La casilla alcanzada debe determinarse después del movimiento válido del jugador.

**RF-82.** El sistema debe ejecutar el efecto de la casilla solo cuando la ficha haya concluido su movimiento visible inmediato.

### 5.7.2 Encadenamiento de efectos

**RF-83.** Si la casilla alcanzada provoca un desplazamiento adicional, el sistema debe volver a mover la ficha del jugador conforme al efecto aplicado.

**RF-84.** Después de cada desplazamiento adicional, el sistema debe reevaluar la nueva casilla alcanzada.

**RF-85.** El sistema debe permitir la resolución encadenada de múltiples efectos si así lo exige la secuencia del turno.

**RF-86.** El turno solo debe darse por finalizado cuando ya no existan efectos pendientes asociados a la cadena de resolución iniciada.

### 5.7.3 Coherencia visual y lógica

**RF-87.** La representación visual del turno debe corresponder con la resolución oficial del sistema.

**RF-88.** El sistema debe comunicar de forma explícita los eventos relevantes que ocurran durante la resolución del turno.

---

## 5.8 Requerimientos funcionales de casillas

### 5.8.1 Tipología mínima

**RF-89.** El sistema debe contemplar, al menos, las siguientes categorías de casilla: inicio, normal, bonus, trampa, movimiento especial, minijuego, evento aleatorio y meta.

### 5.8.2 Casillas normales

**RF-90.** Las casillas normales no deben alterar el estado del jugador más allá de servir como punto válido de paso o detención.

### 5.8.3 Casillas bonus

**RF-91.** Las casillas bonus deben poder aplicar ventajas temporales o inmediatas al jugador.

**RF-92.** Entre sus posibles efectos, el sistema debe contemplar avance adicional, obtención de escudo o bonificación al siguiente lanzamiento, según el diseño final de la versión.

### 5.8.4 Casillas trampa

**RF-93.** Las casillas trampa deben poder aplicar efectos perjudiciales al jugador.

**RF-94.** Entre sus posibles efectos, el sistema debe contemplar retroceso, pérdida de turnos o restricción del siguiente lanzamiento, según el diseño final de la versión.

### 5.8.5 Casillas de movimiento especial

**RF-95.** Las casillas de movimiento especial deben poder desplazar al jugador hacia otra posición del tablero.

**RF-96.** Los desplazamientos provocados por una casilla especial deben ser resueltos conforme a la lógica de encadenamiento general del turno.

### 5.8.6 Casillas de evento aleatorio

**RF-97.** El sistema debe permitir la existencia de casillas que activen un evento rápido o carta aleatoria.

**RF-98.** El evento aleatorio debe producir una consecuencia consistente y comunicarse claramente a los jugadores.

### 5.8.7 Casillas con estados persistentes

**RF-99.** El sistema debe permitir que ciertas casillas apliquen estados persistentes al jugador, incluso cuando dichos estados afecten turnos posteriores.

**RF-100.** Los estados persistentes aplicados por una casilla deben mantenerse activos hasta que se cumpla su regla de expiración o resolución.

---

## 5.9 Requerimientos funcionales de minijuegos

### 5.9.1 Activación e integración

**RF-101.** El sistema debe activar un minijuego cuando el jugador alcance una casilla que así lo requiera o cuando otra regla del juego lo determine.

**RF-102.** El minijuego debe abrirse únicamente después de que la ficha haya concluido el movimiento visible correspondiente a la activación.

**RF-103.** El sistema debe permitir integrar minijuegos individuales y minijuegos de enfrentamiento entre jugadores.

**RF-104.** El sistema debe mostrar la interfaz del minijuego al jugador o jugadores correspondientes.

### 5.9.2 Resultado del minijuego

**RF-105.** El sistema debe registrar el resultado del minijuego.

**RF-106.** El resultado del minijuego debe producir una consecuencia verificable dentro del estado principal de la partida.

**RF-107.** Una vez terminado el minijuego, el sistema debe actualizar de forma consistente el estado general del tablero o del jugador afectado.

### 5.9.3 Minijuego pendiente y castigo persistente

**RF-108.** Si un jugador pierde un minijuego asociado a una casilla del tablero, el sistema debe mantenerlo en la casilla donde se produjo el desafío.

**RF-109.** Si un jugador pierde ese minijuego, el sistema debe registrar dicho reto como minijuego pendiente.

**RF-110.** Mientras un jugador tenga un minijuego pendiente, el sistema no debe permitirle lanzar dado en su siguiente turno normal.

**RF-111.** Mientras exista un minijuego pendiente, el sistema debe obligar al jugador a repetir ese mismo reto hasta que lo supere.

**RF-112.** Cuando el jugador gane el minijuego pendiente, el sistema debe liberarlo del bloqueo correspondiente.

**RF-113.** El turno en que el jugador se libere del minijuego pendiente debe considerarse consumido.

**RF-114.** El lanzamiento de dado solo debe volver a habilitarse en el turno posterior a la liberación.

### 5.9.4 Estados internos del minijuego

**RF-115.** El sistema debe manejar estados internos reconocibles para la vida útil de un minijuego, tales como preparación, activo, resolución, éxito, derrota y cierre.

**RF-116.** La interfaz del minijuego debe comunicar con claridad el estado en que se encuentra el reto.

### 5.9.5 Observación y contexto compartido

**RF-117.** Si el alcance funcional lo contempla, el sistema debe permitir que otros jugadores observen o comprendan el desarrollo general de un minijuego mediante una vista directa o una interfaz resumida.

---

## 5.10 Requerimientos funcionales de chat e interacción social

**RF-118.** El sistema debe ofrecer un chat asociado a la sala o partida dentro del alcance definido.

**RF-119.** El sistema debe permitir a los jugadores enviar mensajes públicos visibles para los demás integrantes autorizados de la sesión.

**RF-120.** El sistema debe impedir que usuarios ajenos a la sala accedan a los mensajes de ese chat.

**RF-121.** Los mensajes del chat deben actualizarse en tiempo real para los participantes autorizados.

**RF-122.** Si el producto incluye mensajería privada en etapas cercanas, esta debe quedar claramente diferenciada del chat público de sala.

---

## 5.11 Requerimientos funcionales de sincronización y tiempo real

**RF-123.** El sistema debe sincronizar en tiempo real los cambios relevantes de la sala y de la partida para todos los jugadores conectados.

**RF-124.** La sincronización debe cubrir, como mínimo, eventos de lobby, inicio de partida, fases preparatorias, selección de personaje, turnos, movimientos, casillas, minijuegos, chat y resultado final.

**RF-125.** El sistema debe mantener una única versión válida del estado de la partida, controlada por la lógica central.

**RF-126.** Las acciones realizadas dentro de una sala deben afectar únicamente a esa sala y a su partida asociada.

**RF-127.** El sistema debe propagar cambios relevantes con suficiente inmediatez como para sostener la experiencia multijugador.

---

## 5.12 Requerimientos funcionales de finalización de partida

**RF-128.** El sistema debe detectar cuándo un jugador cumple la condición de victoria.

**RF-129.** El sistema debe anunciar el ganador a todos los participantes de la partida.

**RF-130.** El sistema debe mostrar un estado, pantalla o interfaz de cierre al finalizar la sesión.

**RF-131.** Una vez declarada la victoria, el sistema no debe permitir que la partida continúe resolviendo turnos normales.

**RF-132.** El sistema debe conservar, al menos, la relación estructural entre la partida concluida y el jugador ganador.

---

## 5.13 Requerimientos funcionales de persistencia

**RF-133.** El sistema debe almacenar la información básica de los usuarios registrados.

**RF-134.** El sistema debe almacenar la información principal de las salas creadas.

**RF-135.** El sistema debe almacenar la relación entre usuarios y salas.

**RF-136.** El sistema debe almacenar la información principal de las partidas iniciadas.

**RF-137.** El sistema debe almacenar la relación entre usuarios y partidas.

**RF-138.** El sistema debe conservar la información estructural mínima necesaria para reconstruir quién participó en una partida y quién resultó ganador.

**RF-139.** El sistema puede persistir mensajes, resultados de minijuegos o datos históricos ampliados cuando ello resulte compatible con el alcance de la versión.

**RF-140.** El sistema no debe depender de persistir cada microevento efímero del tablero para poder operar correctamente.

---

# 6. Requerimientos no funcionales

Los requerimientos no funcionales describen las condiciones de calidad bajo las cuales el sistema debe operar. En conjunto, delimitan el estándar mínimo esperado de usabilidad, rendimiento, seguridad, mantenibilidad, despliegue y profesionalización del producto.

---

## 6.1 Requerimientos no funcionales de usabilidad

**RNF-01.** El sistema debe ofrecer una interfaz clara, comprensible y adecuada para usuarios sin conocimientos técnicos.

**RNF-02.** La navegación entre pantallas principales debe resultar intuitiva y consistente.

**RNF-03.** El sistema debe comunicar con claridad el estado actual del usuario, de la sala y de la partida.

**RNF-04.** El usuario debe poder identificar fácilmente si puede actuar, si debe esperar o si existe una condición pendiente que afecta su turno.

**RNF-05.** Los mensajes de error, validación o restricción deben mostrarse con lenguaje claro y directo.

**RNF-06.** La interfaz debe reducir al mínimo la ambigüedad respecto de fases, turnos, castigos, bloqueos y resultados.

**RNF-07.** Los elementos interactivos principales deben ser visualmente distinguibles y fáciles de utilizar.

**RNF-08.** El sistema debe mantener una experiencia visual agradable, ordenada y coherente con una plataforma de juego en línea.

---

## 6.2 Requerimientos no funcionales de accesibilidad operativa

**RNF-09.** La plataforma debe ser accesible desde un navegador moderno sin requerir instalación manual del código fuente.

**RNF-10.** El usuario no debe depender de herramientas de desarrollo para utilizar la aplicación.

**RNF-11.** El acceso al juego debe encontrarse centralizado en una plataforma única y coherente.

**RNF-12.** La interfaz debe adaptarse razonablemente a resoluciones de pantalla comunes en computadoras personales modernas.

---

## 6.3 Requerimientos no funcionales de rendimiento y fluidez

**RNF-13.** El sistema debe responder en tiempos razonables a las acciones principales del usuario.

**RNF-14.** La carga inicial de las pantallas fundamentales debe mantenerse dentro de tiempos aceptables para una experiencia fluida.

**RNF-15.** Los eventos sincronizados de una misma partida deben propagarse con latencia suficientemente baja como para no deteriorar la experiencia de juego.

**RNF-16.** La actualización del tablero, de los turnos y de los mensajes de chat debe producirse de forma fluida dentro de una sala activa.

**RNF-17.** El uso de imágenes, audios y otros recursos debe gestionarse de manera razonablemente optimizada.

**RNF-18.** Los minijuegos deben ejecutarse con suficiente estabilidad como para no percibirse como interrupciones defectuosas del flujo principal.

---

## 6.4 Requerimientos no funcionales de consistencia y tiempo real

**RNF-19.** Cada partida debe contar con una única versión válida de su estado.

**RNF-20.** La lógica central debe ser responsable de los resultados críticos del juego.

**RNF-21.** Todos los jugadores de una misma sala deben visualizar un estado consistente de la sesión compartida.

**RNF-22.** La arquitectura debe impedir que eventos de una sala se filtren o afecten a otra sala distinta.

**RNF-23.** La secuencia visual presentada al usuario debe corresponder con la resolución oficial del sistema.

---

## 6.5 Requerimientos no funcionales de seguridad

**RNF-24.** El sistema debe proteger el acceso mediante autenticación con credenciales válidas.

**RNF-25.** Las contraseñas no deben almacenarse en texto plano.

**RNF-26.** El sistema debe validar permisos antes de autorizar acciones sensibles, como iniciar una partida o ejecutar acciones de turno.

**RNF-27.** El sistema debe impedir manipulaciones directas del cliente sobre datos críticos como turnos, posiciones, tiradas o condición de victoria.

**RNF-28.** El acceso a salas privadas debe depender de un código válido generado por el sistema.

**RNF-29.** El acceso al chat y a la información de la partida debe restringirse a los usuarios autorizados de la sesión correspondiente.

**RNF-30.** La plataforma debe proteger razonablemente la información de usuario y aplicar controles adecuados sobre el acceso a datos persistentes.

---

## 6.6 Requerimientos no funcionales de mantenibilidad y arquitectura

**RNF-31.** El sistema debe estructurarse de forma modular.

**RNF-32.** La lógica del juego no debe quedar rígidamente mezclada con la presentación visual.

**RNF-33.** El proyecto debe organizar autenticación, lobbies, tablero, minijuegos, chat, persistencia y utilidades compartidas como áreas distinguibles.

**RNF-34.** La base de código debe facilitar comprensión, mantenimiento y evolución futura.

**RNF-35.** La arquitectura debe favorecer la incorporación de nuevas casillas, nuevos minijuegos y nuevas funciones sin requerir reconstrucción total del sistema.

**RNF-36.** Las configuraciones importantes del proyecto deben manejarse de forma externa y no fijarse rígidamente dentro del código fuente.

**RNF-37.** La gestión de recursos multimedia debe centralizarse para evitar dependencias locales específicas por máquina.

**RNF-38.** Las reglas principales del juego deben estructurarse de forma suficientemente clara como para permitir revisión y prueba.

---

## 6.7 Requerimientos no funcionales de escalabilidad inicial

**RNF-39.** La solución debe permitir el crecimiento gradual del proyecto sin exigir rediseño total de su base.

**RNF-40.** El sistema debe poder soportar múltiples lobbies activos simultáneamente dentro de los límites razonables de la infraestructura de la primera versión.

**RNF-41.** La selección tecnológica debe permitir futuras extensiones como historial, ranking, personalización, nuevos minijuegos y profundización social.

---

## 6.8 Requerimientos no funcionales de despliegue y portabilidad

**RNF-42.** El sistema debe poder desplegarse en un entorno accesible por internet.

**RNF-43.** El uso normal de la plataforma no debe requerir modificación manual de rutas, direcciones o parámetros internos por parte del usuario final.

**RNF-44.** Las imágenes, sonidos y demás recursos del juego deben encontrarse organizados de forma centralizada y accesible desde la aplicación desplegada.

**RNF-45.** El despliegue del sistema debe poder reproducirse en distintos entornos con intervención manual mínima sobre la lógica interna del proyecto.

---

## 6.9 Requerimientos no funcionales de calidad visual y audiovisual

**RNF-46.** La plataforma debe mantener una identidad visual coherente con la temática y con la naturaleza de un juego en línea.

**RNF-47.** Los recursos gráficos y sonoros deben integrarse de forma consistente dentro de la interfaz.

**RNF-48.** Las pantallas principales deben priorizar claridad visual, legibilidad y coherencia estética.

**RNF-49.** Las transiciones entre fases, eventos y minijuegos deben sentirse compatibles con el flujo general de la experiencia.

**RNF-50.** El atractivo visual no debe comprometer la comprensión funcional del estado del juego.

---

## 6.10 Requerimientos no funcionales de calidad del software y profesionalización

**RNF-51.** El sistema debe favorecer la reutilización de componentes y lógica compartida cuando corresponda.

**RNF-52.** La estructura del proyecto debe ser legible para nuevos desarrolladores o revisores.

**RNF-53.** El diseño del sistema debe permitir introducir pruebas, validaciones y refactorizaciones de forma progresiva.

**RNF-54.** El software debe reducir duplicación innecesaria de lógica entre módulos.

**RNF-55.** La base del proyecto debe servir como fundamento para una evolución profesional del producto y no solo como solución puntual de corto alcance.

---

# 7. Requerimientos de datos y modelo inicial

El modelo de datos debe respaldar la estructura persistente del sistema. No se busca en esta etapa una definición cerrada e inmutable, pero sí una base suficientemente clara para representar usuarios, salas, partidas, participación, personajes y resultados estructurales.

---

## 7.1 Principio general de persistencia

**RD-01.** La base de datos debe almacenar principalmente la información persistente del sistema.

**RD-02.** El estado altamente efímero de una partida, como animaciones, microfases visuales o temporizadores transitorios, no debe persistirse obligatoriamente en la base de datos para que el sistema funcione.

**RD-03.** El diseño de datos debe diferenciar entre estructura permanente y estado temporal de ejecución.

---

## 7.2 Entidades principales

**RD-04.** El modelo inicial debe poder representar, al menos, perfiles de usuario.

**RD-05.** El modelo inicial debe poder representar lobbies o salas.

**RD-06.** El modelo inicial debe poder representar la relación entre usuarios y lobbies.

**RD-07.** El modelo inicial debe poder representar partidas iniciadas.

**RD-08.** El modelo inicial debe poder representar la relación entre usuarios y partidas.

**RD-09.** El modelo inicial debe poder representar personajes disponibles dentro del juego.

**RD-10.** El modelo puede ampliarse para contemplar mensajes, resultados de minijuegos u otras entidades históricas cuando el alcance de la versión lo permita.

---

## 7.3 Requerimientos de estructura de usuario

**RD-11.** El sistema debe contar con una estructura persistente que represente el perfil funcional del usuario dentro de la aplicación.

**RD-12.** El nombre de usuario debe ser único dentro del sistema.

**RD-13.** La estructura de usuario debe poder asociarse de forma consistente con la identidad autenticada.

---

## 7.4 Requerimientos de estructura de lobby

**RD-14.** La estructura de lobby debe almacenar al menos el identificador de la sala, el usuario administrador, el tipo de sala, el estado y la capacidad máxima.

**RD-15.** Si la sala es privada, la estructura debe poder almacenar un código único de acceso.

**RD-16.** La estructura debe permitir distinguir una sala en espera de una sala ya iniciada, finalizada o cancelada.

---

## 7.5 Requerimientos de estructura de participación en lobby

**RD-17.** Debe existir una estructura que permita representar qué usuarios pertenecen a un lobby dado.

**RD-18.** La estructura debe impedir duplicaciones inválidas del mismo usuario dentro del mismo lobby activo.

**RD-19.** La estructura debe permitir identificar al administrador dentro del contexto del lobby.

---

## 7.6 Requerimientos de estructura de partida

**RD-20.** Debe existir una estructura que represente la partida formal ya iniciada, separándola conceptualmente del lobby previo.

**RD-21.** La estructura de partida debe poder almacenar al menos su identificador, estado general, referencia al lobby que la originó y ganador cuando corresponda.

---

## 7.7 Requerimientos de estructura de participación en partida

**RD-22.** Debe existir una estructura que permita representar qué usuarios participaron en una partida concreta.

**RD-23.** La estructura de participación en partida debe poder asociar información relevante como personaje, orden de turno o resultado estructural.

---

## 7.8 Requerimientos de estructura de personajes

**RD-24.** El sistema debe contar con una representación estructurada de los personajes disponibles.

**RD-25.** La estructura de personajes debe permitir identificar, al menos, un nombre y una referencia a recurso visual asociado.

---

## 7.9 Requerimientos de persistencia histórica mínima

**RD-26.** El sistema debe conservar la relación entre una partida concluida y su ganador.

**RD-27.** El sistema debe conservar la relación entre una partida concluida y los jugadores que participaron en ella.

**RD-28.** La persistencia histórica ampliada, como resultados detallados de minijuegos o historial de mensajes, puede incorporarse en etapas posteriores sin afectar la validez del modelo base.

---

# 8. Criterios de aceptación generales

Los siguientes criterios sintetizan condiciones de aceptación a nivel global para la primera versión del sistema.

**CA-01.** La plataforma debe permitir que un usuario se registre, inicie sesión, cree o se una a una sala y llegue al lobby correspondiente.

**CA-02.** La plataforma debe permitir iniciar una partida multijugador válida desde un lobby con al menos dos participantes.

**CA-03.** La plataforma debe permitir completar las fases de preparación y llegar al tablero principal.

**CA-04.** La partida debe poder desarrollarse mediante turnos válidos, lanzamiento de dado, movimiento visible y resolución de casillas.

**CA-05.** La activación de un minijuego debe integrarse correctamente con el flujo principal del tablero.

**CA-06.** La derrota en un minijuego de casilla debe producir un estado pendiente que afecte turnos posteriores conforme a la regla documentada.

**CA-07.** Todos los jugadores de una misma sala deben visualizar un estado suficientemente consistente de la partida compartida.

**CA-08.** El sistema debe poder declarar un ganador válido y cerrar formalmente la partida.

---

# 9. Cierre del documento

En conjunto, los requerimientos aquí definidos establecen la base formal mínima esperada para la primera versión de Poorty Goblin Web como producto web multijugador serio, coherente y técnicamente defendible.

Estos requerimientos no solo delimitan lo que la plataforma debe hacer, sino también cómo debe sostenerse en términos de claridad funcional, estabilidad del estado compartido, integración entre tablero y minijuegos, y capacidad de evolución futura. A partir de ellos es posible derivar módulos técnicos, prioridades de desarrollo, criterios de validación, diseño de pruebas y refinamientos arquitectónicos posteriores.

La intención final de este documento es que Poorty Goblin Web no se desarrolle como una suma improvisada de pantallas o mecánicas, sino como un sistema planificado, extensible y progresivamente profesionalizable.
