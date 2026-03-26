# Documentación General de Poorty Goblin Web

## 1. Objetivo del proyecto

**Poorty Goblin Web** es una plataforma de juego multijugador en línea, de tablero y por turnos, concebida como una aplicación web interactiva accesible desde navegador y orientada a ofrecer una experiencia compartida, sincronizada y estructuralmente coherente entre varios usuarios conectados simultáneamente.

El proyecto nace de la necesidad de replantear una idea de juego previa dentro de un contexto técnico más adecuado para una solución moderna. En lugar de depender de una ejecución local, de lógica demasiado acoplada o de flujos limitados a un entorno académico o prototípico, Poorty Goblin Web se formula como un sistema completo: con autenticación, organización de partidas, flujo de juego definido, sincronización en tiempo real, tablero compartido, resolución de eventos y una arquitectura capaz de crecer con el tiempo.

El propósito del proyecto no es únicamente “trasladar un juego a la web”, sino **diseñar un producto digital consistente**, con reglas claras, comportamiento estable, identidad temática propia y una base de software lo suficientemente ordenada para permitir mantenimiento, ampliación y profesionalización posterior.

Desde esta perspectiva, Poorty Goblin Web busca responder a varias necesidades simultáneas:

### 1.1 Accesibilidad

El usuario no debe necesitar conocimientos técnicos para participar. La experiencia debe comenzar desde el navegador, mediante un flujo de acceso claro y simple.

### 1.2 Multijugador distribuido

Cada jugador debe poder conectarse desde su propia sesión y compartir una misma partida con otros usuarios, manteniendo un estado común correctamente sincronizado.

### 1.3 Orden funcional y técnico

El sistema debe organizar adecuadamente las responsabilidades entre interfaz, lógica de juego, persistencia, recursos multimedia y sincronización en tiempo real.

### 1.4 Escalabilidad conceptual

La primera versión del proyecto debe funcionar como una base sólida sobre la cual puedan incorporarse nuevas casillas, minijuegos, módulos sociales, mejoras audiovisuales y refinamientos de arquitectura sin necesidad de rediseñar todo el sistema desde cero.

En consecuencia, Poorty Goblin Web debe entenderse como una propuesta de producto digital integral: un juego web multijugador con una lógica central bien definida, una experiencia claramente estructurada y una arquitectura proyectada para evolucionar.

---

## 2. Descripción general del sistema

Poorty Goblin Web es un videojuego de tablero multijugador en línea en el que entre **dos y seis jugadores** participan dentro de una misma sesión compartida. Cada usuario accede mediante su propia cuenta, interactúa desde su propia interfaz y ejecuta solo las acciones que le corresponden según la fase o el turno actual. Sin embargo, todos los participantes conectados a una misma partida deben compartir el mismo estado global del juego.

Ese estado compartido incluye, como mínimo:

* la composición actual de la sala;
* el estado del lobby;
* el orden de participación;
* los personajes elegidos;
* el tablero en juego;
* la posición de cada ficha;
* los eventos que se van resolviendo;
* los castigos o beneficios activos;
* y la condición de victoria.

El sistema combina varias capas de experiencia que deben operar como una sola unidad funcional:

1. **Autenticación de usuarios**, para garantizar acceso individual y persistencia básica de identidad.
2. **Lobbies o salas de partida**, donde los jugadores se agrupan antes del inicio del juego.
3. **Fases de preparación**, necesarias para definir el orden de juego y la asignación de personaje.
4. **Tablero principal**, que concentra el avance general de la partida.
5. **Casillas especiales**, que modifican el curso del turno mediante beneficios, penalizaciones, movimientos adicionales o activación de eventos.
6. **Minijuegos**, integrados como pruebas reales dentro del recorrido del tablero.
7. **Chat e interacción social**, que refuerzan la naturaleza compartida de la experiencia.
8. **Pantalla o estado de cierre**, que formaliza la finalización de la partida y el anuncio del ganador.

Poorty Goblin Web debe ofrecer una experiencia que sea fácil de comprender en su superficie, pero suficientemente rica como para sostener interés competitivo, variedad de situaciones y ritmo de juego a lo largo de toda la sesión.

---

## 3. Alcance funcional de la versión 1

La primera versión del proyecto debe enfocarse en construir una base funcional completa y coherente, priorizando aquellas características sin las cuales la experiencia central del juego no podría completarse correctamente. El objetivo no es incorporar, desde la etapa inicial, todo el potencial futuro del sistema, sino disponer de una versión jugable de principio a fin, estable en su lógica y ordenada en su diseño técnico.

La versión 1 debe cubrir, al menos, las siguientes áreas:

### 3.1 Registro e inicio de sesión

La plataforma debe permitir que un usuario:

* cree una cuenta nueva;
* inicie sesión con credenciales válidas;
* recupere o restablezca acceso cuando aplique;
* y quede identificado de manera persistente dentro del sistema.

La autenticación no solo resuelve el acceso, sino que sirve de base para futuras funciones como historial, amistades, mensajería, personalización o estadísticas.

### 3.2 Pantalla principal

Una vez autenticado, el usuario debe acceder a una pantalla principal desde la cual pueda realizar las acciones fundamentales del producto, especialmente:

* crear una partida;
* unirse a una partida;
* consultar el estado general de su sesión;
* navegar hacia otras secciones disponibles según el alcance definido.

### 3.3 Creación de partidas públicas y privadas

El sistema debe permitir que un usuario cree una sala bajo alguna de estas modalidades:

* **Sala pública**: visible para otros usuarios y disponible en la lista de partidas activas.
* **Sala privada**: no visible de manera abierta y accesible únicamente mediante un código de ingreso.

En el caso de las salas privadas, el sistema debe generar un identificador o código de acceso suficientemente corto para ser compartido, pero lo bastante controlado como para evitar colisiones o ambigüedades.

### 3.4 Unión a partidas

El usuario debe poder incorporarse a una sala de dos formas:

* seleccionando una partida pública disponible;
* ingresando manualmente el código de una partida privada.

Antes de permitir el ingreso, el sistema debe validar condiciones básicas, entre ellas:

* que la sala exista;
* que no haya sido cerrada;
* que no haya iniciado;
* que tenga cupo disponible;
* y que el usuario no se encuentre en una situación incompatible con ese ingreso.

### 3.5 Lobby multijugador

Cada sala debe operar como un lobby previo a la partida. El lobby es el espacio en el que los jugadores se agrupan, visualizan quiénes están presentes y esperan el inicio formal del juego.

El lobby debe mostrar al menos:

* listado de jugadores conectados;
* cantidad de jugadores presentes;
* capacidad total de la sala;
* tipo de sala (pública o privada);
* identificador o código de acceso cuando corresponda;
* y la identidad del administrador de la partida.

### 3.6 Fase de selección de orden

Antes de ingresar al tablero, la partida debe ejecutar una fase preparatoria cuyo propósito sea definir el orden de participación. Esta fase debe resolverse de forma centralizada y ser visible para todos los jugadores, de modo que todos compartan el mismo resultado final.

### 3.7 Fase de selección de personaje

Una vez definido el orden de participación, debe habilitarse la selección de personaje en la secuencia correspondiente. Cada personaje solo puede ser elegido por un jugador dentro de una misma partida. Las elecciones deben reflejarse para todos los participantes de forma inmediata, evitando duplicaciones o estados inconsistentes.

### 3.8 Tablero principal funcional

La versión 1 debe incluir un tablero jugable y sincronizado, con los siguientes elementos mínimos:

* representación visual del recorrido;
* fichas de todos los jugadores;
* indicación de turno actual;
* lanzamiento de dado;
* movimiento visible de fichas;
* resolución de casillas;
* integración con minijuegos;
* y condición de victoria correctamente identificable.

### 3.9 Casillas especiales

El tablero debe incluir una capa funcional de casillas con comportamientos diferenciados. Estas casillas deben ser capaces de modificar el turno o el estado del jugador mediante reglas claras, consistentes y comprensibles.

### 3.10 Minijuegos integrados

La primera versión debe incluir un conjunto inicial de minijuegos conectados directamente al tablero. El objetivo no es cubrir una colección excesiva, sino contar con suficientes ejemplos funcionales para validar la propuesta central del sistema.

### 3.11 Chat de partida

Cada sala debe contar con un mecanismo de mensajería pública entre los participantes. El chat debe formar parte de la experiencia compartida del lobby y, de ser pertinente, mantenerse disponible durante la partida.

### 3.12 Finalización de partida

El sistema debe reconocer la condición de victoria, registrar el resultado correspondiente y mostrar una resolución final que deje claramente marcado el cierre de la sesión.

---

## 4. Flujo general del usuario

El flujo del usuario describe el recorrido completo de una persona desde su ingreso al sistema hasta la finalización de una partida. Este flujo debe ser claro, consistente y fácil de seguir incluso para alguien que no conoce previamente el juego.

### 4.1 Acceso a la plataforma

El recorrido comienza cuando el usuario accede al sitio web. Si aún no posee una cuenta, puede registrarse; si ya dispone de una, inicia sesión para ingresar a la plataforma.

### 4.2 Ingreso a la pantalla principal

Una vez autenticado, el usuario llega a la pantalla principal. Esta pantalla actúa como centro inicial de navegación y debe presentar, de manera clara, las acciones principales disponibles.

### 4.3 Decisión inicial: crear o unirse a una partida

Desde la pantalla principal, el usuario elige una de las dos rutas principales del sistema:

* crear una nueva sala;
* unirse a una sala existente.

### 4.4 Crear partida

Si opta por crear una partida, el usuario debe definir el tipo de sala. Dependiendo de la modalidad elegida, la sala quedará disponible públicamente o requerirá un código de acceso para invitados.

### 4.5 Unirse a partida

Si decide unirse a una partida, el sistema debe ofrecer dos mecanismos:

* listado de salas públicas disponibles;
* ingreso por código para salas privadas.

### 4.6 Ingreso al lobby

Después de crear o unirse a una sala, el usuario accede al lobby. Aquí puede ver quiénes están presentes, quién administra la partida y si ya se alcanzan las condiciones necesarias para iniciar.

### 4.7 Inicio formal de la partida

Cuando el administrador decide iniciar, el sistema cierra el ingreso de nuevos participantes y comienza la transición hacia las fases preparatorias.

### 4.8 Selección de orden

Todos los jugadores participan en una fase que define la secuencia oficial con la que se desarrollarán acciones posteriores.

### 4.9 Selección de personaje

Siguiendo el orden definido, cada jugador elige un personaje. El sistema actualiza en tiempo real qué opciones siguen disponibles.

### 4.10 Inicio del tablero

Una vez concluidas las fases previas, el sistema lleva a todos los jugadores al tablero principal. Todos comienzan en la casilla inicial, con una ficha asociada al personaje seleccionado.

### 4.11 Desarrollo de la partida

La partida se desarrolla mediante una secuencia ordenada de turnos. En cada turno, el jugador activo puede lanzar el dado, mover su ficha y resolver el efecto de la casilla alcanzada. Si corresponde, se activa un minijuego o un efecto adicional.

### 4.12 Cierre de la partida

Cuando un jugador cumple la condición de victoria, el sistema marca el final de la partida, anuncia el resultado y presenta la resolución correspondiente.

---

## 5. Flujo interno de una partida

Más allá del recorrido del usuario entre pantallas, la partida en sí misma debe responder a una lógica interna clara, estructurada por fases.

### 5.1 Estado de lobby

La partida existe primero como una sala de espera. Durante este estado:

* pueden ingresar jugadores si la sala lo permite;
* se muestra la lista de participantes;
* y aún no existe progreso de tablero.

### 5.2 Estado de preparación

Una vez que la sala es iniciada por el administrador, el sistema entra en una etapa preparatoria. En esta etapa se resuelven dos procesos fundamentales:

* definición del orden de participación;
* selección de personaje.

### 5.3 Estado de juego activo

Luego comienza el estado principal de partida. Este es el momento en el que el tablero se vuelve el centro de la experiencia y el sistema alterna entre turnos, movimientos, casillas, eventos y minijuegos.

### 5.4 Estado de resolución de eventos

Durante el juego activo, cada turno puede abrir una subcadena de resolución: movimiento inicial, caída en una casilla, efecto de esa casilla, nuevo movimiento, nueva resolución, activación de un minijuego o aplicación de un estado persistente.

### 5.5 Estado de cierre

Cuando se alcanza la condición de victoria, la partida deja de aceptar acciones normales de tablero y pasa a un estado final donde el sistema presenta el resultado oficial.

---

## 6. Reglas generales del juego web

Las reglas generales describen la manera en que Poorty Goblin Web debe comportarse como sistema de juego, independientemente de cómo se represente visualmente.

### 6.1 Cantidad de jugadores

Cada partida debe admitir un mínimo de **2 jugadores** y un máximo de **6 jugadores**.

### 6.2 Rol del administrador

Toda sala debe tener un administrador, que será el usuario creador. Solo el administrador puede iniciar la partida.

### 6.3 Cierre de ingreso al comenzar

Una vez iniciada la partida, no deben permitirse nuevos ingresos a la sesión correspondiente.

### 6.4 Orden de participación

El orden de juego debe definirse antes del inicio del tablero y luego utilizarse como referencia para:

* la selección de personaje;
* el primer turno;
* y la secuencia de rondas posteriores.

### 6.5 Control estricto de turnos

Solo el jugador al que corresponde el turno puede ejecutar acciones activas de tablero.

### 6.6 Autoridad central del sistema

Las decisiones críticas no deben quedar bajo control del cliente. El sistema central debe validar y resolver, entre otros, los siguientes aspectos:

* legitimidad del turno;
* resultado del dado;
* posición final del jugador;
* casilla alcanzada;
* aplicación de bonus o castigos;
* activación de minijuegos;
* estados pendientes;
* cambio de turno;
* y condición de victoria.

### 6.7 Regla de llegada exacta a meta

La meta solo debe alcanzarse de forma válida. Si el valor del movimiento excede la casilla final, el sistema debe aplicar la regla de retroceso equivalente al excedente.

### 6.8 Claridad en la resolución del turno

El sistema debe respetar un flujo visual y lógico comprensible. Primero debe resolverse el movimiento visible de la ficha y solo después debe ejecutarse el efecto de la casilla alcanzada. Esto es esencial tanto para la comprensión del usuario como para la integridad del sistema.

---

## 7. Sistema del tablero

El tablero constituye el núcleo central de la partida. No es únicamente una representación gráfica de progreso, sino el espacio en el que se materializan las reglas, la incertidumbre, la competencia y la variedad de eventos del juego.

### 7.1 Función del tablero

El tablero debe cumplir, como mínimo, las siguientes funciones:

* representar el recorrido entre la casilla inicial y la meta;
* mostrar la posición actual de cada jugador;
* evidenciar de quién es el turno;
* servir como punto de activación de casillas y eventos;
* y expresar visualmente el estado del progreso general de la partida.

### 7.2 Elementos visibles mínimos

La interfaz del tablero debe comunicar con claridad:

* la ruta de casillas;
* las fichas de todos los jugadores;
* el jugador en turno;
* el control de dado cuando aplique;
* la posición relativa de cada participante;
* el resultado de eventos recientes;
* y cualquier estado relevante que afecte la resolución del turno.

### 7.3 Naturaleza del tablero como sistema dinámico

El tablero no debe entenderse como un escenario pasivo. Cada casilla puede desencadenar reglas, movimientos adicionales o pruebas externas. Por ello, su diseño debe contemplar tanto la representación visual como la lógica de resolución que define su comportamiento.

---

## 8. Resolución del turno y modelo de encadenamiento

Uno de los principios más importantes del sistema es que el turno no termina necesariamente cuando el jugador lanza el dado ni cuando su ficha se detiene por primera vez.

### 8.1 Secuencia base del turno

En términos generales, un turno debe resolverse de la siguiente manera:

1. el jugador habilitado ejecuta la acción de lanzamiento;
2. el sistema valida la acción y determina el resultado;
3. la ficha se mueve visualmente por el tablero;
4. cuando el movimiento concluye, se identifica la casilla alcanzada;
5. se ejecuta el efecto correspondiente de esa casilla;
6. si ese efecto genera un nuevo desplazamiento o una nueva obligación, se continúa la cadena de resolución;
7. el turno solo termina cuando ya no existen eventos pendientes asociados a ese movimiento.

### 8.2 Encadenamiento de casillas

El tablero debe operar bajo una lógica de encadenamiento. Esto significa que si una casilla mueve al jugador a otra posición, la nueva posición también debe ser evaluada.

Ejemplo general:

1. el jugador cae en una trampa;
2. la trampa provoca un retroceso;
3. la ficha se mueve nuevamente;
4. llega a una nueva casilla;
5. esa nueva casilla también debe resolverse.

### 8.3 Importancia del encadenamiento

Esta regla evita que el tablero se comporte como una colección arbitraria de efectos aislados y permite que la partida conserve coherencia causal. Además, facilita que el usuario comprenda que cada consecuencia deriva de una posición concreta y no de una decisión invisible del sistema.

---

## 9. Tipos de casilla

La primera versión de Poorty Goblin Web debe contemplar una taxonomía de casillas lo suficientemente clara para el usuario y lo suficientemente flexible para el diseño futuro del sistema.

### 9.1 Casilla de inicio

Es la posición donde todos los jugadores comienzan la partida. No debe aplicar efectos adicionales.

### 9.2 Casilla normal

Es una casilla sin consecuencia especial. Su función principal es generar ritmo y equilibrio dentro del tablero, evitando que cada paso implique una alteración del estado.

### 9.3 Casilla bonus

Favorece al jugador que cae sobre ella. Entre los efectos que puede producir se encuentran:

* avance adicional;
* obtención de escudo o protección;
* bonificación para el siguiente lanzamiento;
* o cualquier otra ventaja mecánica temporal.

### 9.4 Casilla trampa

Perjudica al jugador. Sus efectos pueden incluir:

* retroceso;
* pérdida de uno o más turnos;
* restricción del siguiente lanzamiento;
* o aplicación de un estado negativo equivalente.

### 9.5 Casilla de movimiento especial

Altera el recorrido de forma explícita. Puede representar portales, tubos, atajos, desvíos o desplazamientos directos hacia otra posición.

### 9.6 Casilla de minijuego

Obliga al jugador a entrar en una prueba específica. Esta casilla tiene un impacto directo sobre la continuidad del avance y no debe tratarse como un elemento únicamente ornamental.

### 9.7 Casilla de evento aleatorio o Mazo del Caos

Activa una carta o evento breve con efecto inmediato. Su objetivo es introducir incertidumbre y variación dentro del tablero sin convertirse necesariamente en un reto largo o autónomo.

### 9.8 Casilla de meta

Representa la posición final del recorrido y la posibilidad de victoria, siempre que el jugador llegue de forma válida según las reglas del sistema.

---

## 10. Sistema de minijuegos

Los minijuegos son una de las capas más importantes del proyecto. Deben diseñarse y documentarse como parte estructural del flujo principal, no como interrupciones superficiales ni como piezas aisladas sin consecuencias reales.

### 10.1 Función de los minijuegos

Los minijuegos cumplen varias funciones dentro de la experiencia:

* introducen variedad entre turnos de tablero;
* modifican el ritmo de la partida;
* añaden tensión y expectativa;
* incorporan habilidad, memoria o reflejos;
* y convierten ciertas casillas en obstáculos o pruebas significativas.

### 10.2 Condición de activación

Un minijuego se activa cuando un jugador alcanza una casilla que lo requiera, o cuando otra regla del sistema así lo determine.

### 10.3 Principio visual de activación

El minijuego debe abrirse **después** de que la ficha haya completado su movimiento visible y la casilla de destino haya quedado identificada claramente. Este principio es importante para mantener orden visual, claridad narrativa del turno y coherencia entre tablero y evento.

### 10.4 Regla de castigo por derrota

Si un jugador pierde un minijuego:

* permanece en la casilla donde se activó el desafío;
* no obtiene avance adicional ni corrección automática de posición;
* queda marcado con ese minijuego como obligación pendiente;
* en su siguiente turno no lanza dado;
* y debe repetir el mismo reto hasta vencerlo.

### 10.5 Regla de liberación

Cuando el jugador finalmente gana el minijuego pendiente:

* se elimina la condición que lo bloqueaba;
* el turno en el que obtuvo la liberación se considera consumido;
* y el jugador solo vuelve a lanzar dado en el turno siguiente.

### 10.6 Importancia de esta regla

Esta lógica convierte al minijuego en una consecuencia real del tablero. Perder no significa simplemente “ver una escena de fallo”, sino aceptar una penalización de progreso. En términos de diseño, esto hace que la casilla de minijuego funcione como obstáculo auténtico.

### 10.7 Criterios de diseño de minijuegos

Los minijuegos deben aspirar a ser:

* claros de comprender;
* rápidos de aprender;
* razonablemente breves;
* consistentes en interfaz;
* estables en su ejecución;
* y suficientemente entretenidos para que repetirlos no se perciba como un castigo puramente tedioso.

### 10.8 Estados internos de un minijuego

A nivel lógico, resulta conveniente que los minijuegos contemplen estados reconocibles, tales como:

* espera o preparación;
* activo;
* resolución;
* éxito;
* derrota;
* pendiente de repetición;
* y cierre.

Esta estructura favorece tanto la claridad de la interfaz como la robustez técnica del sistema.

---

## 11. Minijuegos contemplados para la línea base

La línea base del proyecto debe considerar un conjunto inicial de minijuegos suficientemente diverso para validar varias formas de interacción.

### 11.1 Memory de Reliquias

Minijuego basado en memoria de parejas. En su modalidad competitiva, puede enfrentar a dos jugadores y alternar turnos. Su diseño debe reforzar la tensión de observación, memoria y competencia directa.

### 11.2 Guerra Goblin de Cartas

Duelo rápido de cartas en el que los jugadores comparan valores o resuelven reglas simples de enfrentamiento. Debe ser breve, claro y visualmente expresivo.

### 11.3 Ruta del Pantano

Minijuego individual de memoria espacial. El jugador observa una secuencia o recorrido y luego debe reproducirlo correctamente.

### 11.4 Ritual del Tótem

Minijuego individual basado en precisión, reflejos o timing. Su diseño debe depender de ejecución oportuna más que de conocimiento previo.

### 11.5 Runas del Chamán

Minijuego individual de secuencia y memoria ritual. El jugador debe observar un patrón y reproducirlo en el orden correcto.

### 11.6 Mazo del Caos

Aunque no debe tratarse como un minijuego largo en sentido estricto, sí constituye un sistema de eventos especiales que aporta aleatoriedad controlada, alteración de condiciones y sorpresa táctica.

---

## 12. Qué no debe incluir todavía la versión 1

Una documentación profesional no solo debe definir lo que el sistema hará, sino también lo que no se considera prioritario en la etapa inicial. Esta delimitación es importante para mantener el alcance controlado y realista.

### 12.1 Cobertura total de minijuegos

La primera versión no necesita implementar una biblioteca extensa de minijuegos. Debe priorizar un conjunto reducido, pero bien integrado y funcional.

### 12.2 Multiplicidad de tableros o modos complejos

No se priorizarán, en esta etapa, múltiples tableros altamente diferenciados ni modos de juego avanzados con configuraciones complejas.

### 12.3 Personalización extensa de perfil

No forman parte del núcleo inicial características como cosméticos avanzados, progresión visual, avatares complejos o configuraciones de identidad muy profundas.

### 12.4 Ranking competitivo global

Tablas de clasificación, temporadas, ligas o sistemas avanzados de puntuación pueden considerarse en fases futuras, pero no son indispensables para validar la experiencia base.

### 12.5 Reconexión compleja y recuperación avanzada de sesión

Aunque es una mejora importante a futuro, la primera versión no necesita resolver todos los casos extremos de reconexión o continuidad perfecta después de desconexiones prolongadas.

### 12.6 Infraestructura para alto volumen masivo

La arquitectura inicial debe ser ordenada y estable, pero no necesariamente optimizada desde el primer momento para escalamiento masivo o distribución compleja.

### 12.7 Acabado audiovisual extremo

La identidad visual debe ser coherente y atractiva, pero la prioridad inicial sigue siendo la correcta consolidación funcional del producto.

### 12.8 Herramientas administrativas avanzadas

No se requiere todavía un panel administrativo extenso para gestión profunda de usuarios, moderación compleja o intervención manual del sistema.

---

## 13. Arquitectura general del sistema

La arquitectura de Poorty Goblin Web debe plantearse como la de una aplicación web multijugador dividida en capas funcionales, cada una con responsabilidades diferenciadas. Esta separación es fundamental para reducir acoplamiento, facilitar mantenimiento y permitir crecimiento progresivo del proyecto.

### 13.1 Frontend web

El frontend constituye la capa visible del sistema. Sus responsabilidades incluyen:

* renderizar pantallas y componentes;
* capturar acciones del usuario;
* mostrar el estado actual de la sesión;
* y reaccionar ante cambios emitidos por la lógica central.

El frontend no debe asumir autoridad sobre resultados críticos del juego. Su papel es representar, solicitar acciones y mostrar consecuencias ya validadas.

### 13.2 Capa de aplicación o servicios

Esta capa concentra reglas operativas complementarias, validaciones y funciones que apoyan el comportamiento general del sistema, por ejemplo:

* autenticación complementaria;
* validación de acceso a salas;
* control de permisos;
* coordinación de procesos del juego;
* y soporte a la persistencia y consulta de datos.

### 13.3 Capa de tiempo real

Esta capa es esencial en una aplicación multijugador. Su función es propagar cambios del estado compartido para que todos los clientes conectados a una misma partida observen la misma realidad de juego.

Debe cubrir eventos como:

* ingreso y salida de jugadores;
* cambios de estado del lobby;
* inicio de partida;
* fases de preparación;
* elecciones de personaje;
* cambio de turno;
* movimiento de fichas;
* resolución de casillas;
* apertura y cierre de minijuegos;
* mensajes de chat.

### 13.4 Base de datos

La base de datos debe conservar la información persistente del sistema: usuarios, perfiles, lobbies, partidas, participaciones, resultados y demás estructuras necesarias para representar el estado duradero del producto.

### 13.5 Recursos estáticos y multimedia

Las imágenes, audios, cartas, fondos, íconos y demás recursos del juego deben mantenerse organizados de forma centralizada, estable y reutilizable.

### 13.6 Principio de autoridad del sistema

La fuente válida del estado del juego no debe residir en el cliente. El usuario puede solicitar acciones, pero el resultado oficial debe derivarse de la lógica central del sistema.

### 13.7 Separación entre estado persistente y estado efímero

Es importante distinguir entre:

* el estado que debe almacenarse en la base de datos;
* y el estado temporal propio de una partida activa, que puede vivir en mecanismos de tiempo real o memoria transitoria.

Esta distinción evita sobrecargar la persistencia con información efímera y favorece una arquitectura más clara.

---

## 14. Tecnologías y software propuestos

La selección tecnológica debe responder a criterios de viabilidad, mantenibilidad, compatibilidad con el enfoque web y capacidad de crecimiento.

### 14.1 Next.js

Se propone como base del proyecto web por su capacidad de estructurar frontend y lógica complementaria dentro de una solución moderna y ordenada.

### 14.2 React

Se utilizará para construir la interfaz interactiva mediante componentes reutilizables y estados de UI bien definidos.

### 14.3 TypeScript

Es especialmente útil en un proyecto de esta naturaleza porque permite tipar con claridad entidades como usuarios, lobbies, partidas, turnos, eventos, casillas, personajes y minijuegos.

### 14.4 Tailwind CSS

Se propone como solución de estilos por su rapidez de desarrollo, consistencia visual y facilidad para mantener diseño reutilizable entre módulos.

### 14.5 Supabase

Se plantea como plataforma de soporte para autenticación, base de datos PostgreSQL, tiempo real y otras capacidades complementarias necesarias para el sistema.

### 14.6 PostgreSQL

Se propone como motor relacional para la persistencia estructurada de la información principal del sistema.

### 14.7 Capa de tiempo real

La tecnología específica puede concretarse según la solución elegida, pero el proyecto debe contar con un mecanismo robusto para sincronización de partidas, cambios de estado y eventos entre múltiples usuarios conectados.

### 14.8 Control de versiones

El desarrollo debe mantenerse bajo control de versiones mediante **Git**, con respaldo en un repositorio remoto como **GitHub**.

### 14.9 Herramientas de diseño y apoyo

Pueden emplearse herramientas como **Figma** para prototipado, diseño de pantallas y validación visual del flujo del usuario.

---

## 15. Módulos y pantallas principales del sistema

A nivel de organización funcional, el sistema puede estructurarse en módulos o pantallas que correspondan a las distintas etapas del flujo del usuario.

### 15.1 Módulo de acceso

Incluye registro, inicio de sesión, recuperación de contraseña y cualquier flujo asociado al acceso del usuario.

### 15.2 Módulo principal

Corresponde a la pantalla inicial del usuario autenticado y concentra las acciones primarias de navegación.

### 15.3 Módulo de creación de partida

Permite definir el tipo de sala y crear una nueva sesión de lobby.

### 15.4 Módulo de unión a partida

Permite explorar partidas públicas o ingresar mediante código a una sala privada.

### 15.5 Módulo de lobby

Gestiona la fase de espera previa al inicio, mostrando participantes, estado de la sala y controles de administración.

### 15.6 Módulo de selección de orden

Corresponde a la fase preparatoria en la que se define la secuencia oficial de participación.

### 15.7 Módulo de selección de personaje

Permite la elección secuencial de personaje y la actualización sincronizada de disponibilidad.

### 15.8 Módulo de tablero principal

Es la pantalla central del sistema. Debe integrar tablero, fichas, turnos, control de dado, mensajes de estado, resolución de efectos y acceso a chat.

### 15.9 Módulo de chat

Puede integrarse como panel dentro del tablero o del lobby, pero constituye una unidad funcional clara de interacción social.

### 15.10 Módulo de minijuegos

Cada minijuego debe poseer su propia interfaz, sus propias reglas y su propio flujo interno, aunque siempre subordinado a la lógica general del tablero.

### 15.11 Módulo de observación de eventos

Dependiendo del alcance, puede contemplarse una interfaz de observación o información contextual para que otros jugadores sepan qué ocurre cuando un participante entra en un reto individual o competitivo.

### 15.12 Módulo de cierre de partida

Corresponde a la interfaz final donde se comunica el resultado de la sesión y se identifica al ganador.

---

## 16. Estructura general de base de datos

La base de datos debe almacenar la información persistente del sistema y permitir una representación clara de las entidades fundamentales del producto.

### 16.1 Principales grupos de información

La estructura general debe ser capaz de representar, al menos:

* identidad del usuario;
* perfil de jugador;
* lobbies o salas;
* relación entre usuarios y salas;
* partidas iniciadas;
* relación entre usuarios y partidas;
* personajes disponibles;
* mensajes persistidos, si así se define;
* y datos históricos o resultados cuando el sistema los contemple.

### 16.2 Usuarios y perfiles

La autenticación puede encargarse de la identidad principal del usuario, mientras que una estructura de perfiles permite registrar la representación funcional del jugador dentro del sistema.

### 16.3 Lobbies

Debe existir una entidad que represente la sala creada, su tipo, su administrador, su estado, su capacidad y su código de acceso cuando corresponda.

### 16.4 Relación usuario-lobby

El sistema debe poder identificar qué usuarios pertenecen a cada sala, en qué momento y bajo qué condición.

### 16.5 Partidas

Conviene distinguir claramente entre el lobby como estado previo y la partida formal como sesión activa de juego.

### 16.6 Relación usuario-partida

Debe ser posible registrar qué jugadores participaron en una partida específica y con qué atributos quedaron asociados, como personaje, orden, posición final o resultado.

### 16.7 Personajes y catálogos auxiliares

Aunque inicialmente se manejen de manera controlada, conviene estructurar personajes, recursos y catálogos auxiliares con suficiente claridad para facilitar mantenimiento y expansión.

### 16.8 Estado dinámico de partida

No toda la información del juego debe almacenarse de forma permanente. Elementos como el turno instantáneo, la animación en curso, la apertura de un minijuego o la cadena de resolución de una casilla pertenecen más al estado efímero de una partida activa.

### 16.9 Principio general de modelado

La base de datos debe conservar aquello que necesita persistencia real. No debe convertirse en sustituto de todos los eventos temporales del juego en tiempo real.

---

## 17. Criterios de experiencia de usuario

Poorty Goblin Web debe diseñarse para que una persona que no conoce el juego pueda comprender qué está ocurriendo en todo momento. Esto exige una experiencia de usuario explícita, consistente y pedagógica.

La interfaz debe comunicar con claridad:

* en qué fase se encuentra la partida;
* a quién le corresponde actuar;
* qué acción está disponible;
* qué ocurrió como resultado de la última acción;
* qué consecuencias permanecen activas;
* y cuál es el estado actual del jugador dentro del sistema.

### 17.1 Claridad visual

La jerarquía de información debe permitir identificar rápidamente lo importante: turno, jugador activo, posición, acción disponible y resultado reciente.

### 17.2 Consistencia entre pantallas

Las distintas fases del sistema deben sentirse parte de una misma experiencia. Esto implica coherencia en diseño visual, lenguaje, iconografía y comportamiento general.

### 17.3 Retroalimentación inmediata

Toda acción relevante debe ofrecer una respuesta visual o sonora comprensible: confirmación, error, éxito, castigo, transición de fase o aviso de espera.

### 17.4 Legibilidad del flujo de turno

El tablero debe hacer evidente cómo se resolvió cada evento. El usuario debe poder seguir mentalmente la secuencia entre lanzamiento, movimiento, casilla y consecuencia.

### 17.5 Reducción de ambigüedad

La interfaz no debe dejar al usuario adivinando si puede actuar, si debe esperar, si perdió un turno, si tiene un castigo pendiente o si debe repetir un minijuego.

---

## 18. Criterios de calidad y profesionalización del software

Además de ser jugable, Poorty Goblin Web debe aspirar a una construcción técnica ordenada. La documentación general debe dejar claro que el proyecto no se concibe como una suma improvisada de pantallas, sino como una solución susceptible de evolucionar profesionalmente.

### 18.1 Modularidad

El código debe organizarse en módulos con responsabilidades comprensibles y separadas.

### 18.2 Reutilización

Componentes visuales, lógica compartida, tipados, recursos y reglas comunes deben diseñarse para ser reutilizados cuando corresponda.

### 18.3 Legibilidad

La estructura del proyecto debe facilitar comprensión por parte de nuevos desarrolladores o revisores.

### 18.4 Evolución controlada

Nuevas funciones deben poder añadirse sin romper innecesariamente el flujo ya consolidado del sistema.

### 18.5 Robustez lógica

La partida no debe depender de supuestos inseguros del cliente. Los resultados importantes deben surgir de una fuente central válida y verificable.

### 18.6 Capacidad de prueba

En la medida de lo posible, la lógica central del juego debe estructurarse de forma que pueda ser validada, revisada o testeada con claridad.

---

## 19. Línea de evolución futura

Una vez consolidada la primera versión, Poorty Goblin Web podrá crecer en varias direcciones sin perder su fundamento principal. Entre las líneas de evolución posibles se encuentran:

* incorporación de nuevos minijuegos;
* ampliación del repertorio de casillas y efectos;
* tableros adicionales o temáticos;
* mejoras de observación de minijuegos y eventos;
* estadísticas de jugador e historial de partidas;
* sistemas sociales más amplios;
* mejoras audiovisuales;
* modos alternativos de juego;
* y mayor profesionalización de arquitectura, pruebas y monitoreo.

La clave es que estas ampliaciones se integren sobre una base ya ordenada, en lugar de exigir una reconstrucción completa del sistema.

---

## 20. Conclusión

Poorty Goblin Web se concibe como una plataforma web multijugador de tablero que articula progresión por turnos, casillas especiales, minijuegos integrados e interacción social en tiempo real dentro de una misma experiencia.

Su valor no radica únicamente en reutilizar la idea de un juego previo, sino en transformarla en una solución digital más clara, más accesible, más estable y mejor preparada para crecer con el tiempo.

La finalidad de esta documentación es establecer una visión general del proyecto con un nivel de formalidad suficiente para orientar desarrollo, diseño funcional y organización técnica desde las bases.

En síntesis, Poorty Goblin Web debe construirse sobre tres principios fundamentales:

* **claridad funcional**, para que el sistema se entienda y se juegue correctamente;
* **solidez técnica**, para que el comportamiento del producto sea consistente;
* **capacidad de evolución**, para que el proyecto pueda profesionalizarse y ampliarse sin perder coherencia.

Sobre esa base, el sistema puede consolidarse no solo como una versión web de un juego de tablero, sino como una propuesta propia, reconocible y extensible a largo plazo.
