# Sistema de Casillas y Minijuegos  
## Poorty Goblin Web

## 1. Objetivo

Este documento describe el funcionamiento esperado del sistema de casillas del tablero y de los minijuegos asociados en **Poorty Goblin Web**.

Su propósito es servir como guía de implementación para:
- interfaces,
- imágenes,
- animaciones,
- audios,
- lógica de resolución,
- integración con el flujo del turno.

La idea principal es que el tablero no solo detecte en qué casilla cae la ficha, sino que resuelva correctamente el efecto de esa casilla de forma visual, ordenada y consistente con la partida.

---

## 2. Principio general del sistema

El turno del jugador debe seguir esta secuencia:

1. el jugador lanza el dado;
2. se obtiene el resultado;
3. la ficha se mueve físicamente por la interfaz;
4. cuando la ficha llega a la casilla destino, se ejecuta el efecto de esa casilla;
5. si la casilla mueve nuevamente al jugador, la ficha vuelve a desplazarse;
6. al llegar a la nueva casilla, también se resuelve su efecto;
7. si la casilla es de minijuego, el minijuego se abre solo cuando la ficha ya terminó su movimiento visual.

### Regla clave
**Nunca debe abrirse un minijuego ni ejecutarse un efecto importante antes de que la ficha termine de moverse visualmente.**

---

## 3. Tipos de casilla

El tablero contempla las siguientes familias de casillas:

- Inicio
- Normal
- Bonus
- Trampa
- Movimiento especial
- Minijuego
- Mazo del Caos
- Meta

---

## 4. Comportamiento de cada tipo de casilla

## 4.1 Casilla de inicio
### Función
Es la casilla inicial del recorrido.

### Comportamiento
- no aplica efectos;
- solo sirve como punto de partida.

### Recomendación visual
- diseño muy reconocible;
- iconografía clara de “inicio”;
- puede tener brillo o marco especial.

---

## 4.2 Casilla normal
### Función
No altera el turno.

### Comportamiento
- el jugador cae;
- no hay castigo ni bonus;
- el turno termina.

### Recomendación visual
- diseño sobrio;
- puede mostrar ambientación del tablero;
- no debe confundirse con casilla especial.

---

## 4.3 Casilla bonus
### Función
Beneficiar al jugador.

### Efectos recomendados
- avanzar 2 casillas;
- ganar un escudo;
- obtener bonus al próximo dado.

### Comportamiento
- se muestra el efecto;
- si el bonus implica movimiento, la ficha vuelve a desplazarse;
- la nueva casilla también debe resolverse.

### Recomendación visual
- color o aura positiva;
- texto de recompensa;
- sonido agradable o brillante.

---

## 4.4 Casilla trampa
### Función
Perjudicar al jugador.

### Efectos recomendados
- retroceder 2 casillas;
- perder el próximo turno;
- limitar el próximo dado.

### Comportamiento
- se muestra el castigo;
- si el castigo mueve al jugador, la ficha vuelve a desplazarse;
- la nueva casilla también debe resolverse.

### Recomendación visual
- tono oscuro o peligroso;
- mensajes claros;
- feedback de “castigo”.

---

## 4.5 Casilla de movimiento especial
### Función
Alterar el recorrido del tablero de forma llamativa.

### Ejemplos
- portal;
- atajo;
- desplazamiento especial a una casilla concreta.

### Comportamiento
- la casilla activa un movimiento nuevo;
- la ficha se mueve visualmente;
- la casilla de destino también debe resolverse.

### Recomendación visual
- animación especial;
- diferencia clara frente a bonus o trampa;
- sensación de “evento del tablero”.

---

## 4.6 Casilla de minijuego
### Función
Obligar al jugador a superar una prueba.

### Minijuegos definidos
- Memory de Reliquias
- Guerra Goblin de Cartas
- Ruta del Pantano
- Ritual del Tótem
- Runas del Chamán

### Comportamiento
- la ficha llega a la casilla;
- se abre la introducción del minijuego;
- se ejecuta el minijuego;
- se determina victoria o derrota;
- si pierde, el jugador queda bloqueado en esa casilla;
- si gana, queda liberado.

### Regla principal
**Perder un minijuego no hace retroceder automáticamente.**
El castigo es quedar pendiente en esa casilla hasta superarlo.

---

## 4.7 Casilla de Mazo del Caos
### Función
Aplicar un evento aleatorio mediante cartas.

### Comportamiento
- la ficha llega;
- se roba una carta;
- se revela la carta;
- se aplica el efecto;
- si el efecto mueve al jugador, la ficha vuelve a desplazarse;
- la nueva casilla también debe resolverse.

### Recomendación
El Mazo del Caos debe sentirse como un evento rápido y sorpresivo, no como un minijuego largo.

---

## 4.8 Casilla de meta
### Función
Cerrar la partida.

### Comportamiento
- si el jugador llega correctamente a la meta, gana;
- debe mostrarse resolución final de partida.

### Recomendación visual
- casilla más destacada del tablero;
- efecto visual o sonoro de victoria.

---

## 5. Regla de encadenamiento

Si una casilla modifica la posición del jugador, la nueva casilla a la que llega también debe evaluarse.

### Ejemplo
1. el jugador cae en una trampa;
2. la trampa lo hace retroceder 2;
3. la ficha retrocede visualmente;
4. llega a otra casilla;
5. esa casilla también se resuelve.

### Esto aplica a:
- bonus de avance,
- trampas de retroceso,
- portales,
- atajos,
- efectos del Mazo del Caos,
- cualquier otro movimiento provocado por casilla.

---

## 6. Regla de minijuego pendiente

Esta es una de las reglas más importantes del sistema.

### Si el jugador pierde un minijuego:
- no avanza;
- no retrocede automáticamente;
- queda bloqueado en esa misma casilla;
- en su siguiente turno no lanza dado;
- debe repetir el mismo minijuego.

### Si luego gana ese minijuego pendiente:
- queda liberado de la casilla;
- ese turno se consume;
- recién en su próximo turno normal podrá volver a lanzar dado.

### Consecuencia jugable
Perder un minijuego cuesta al menos una ronda de avance, por lo que las casillas de minijuego funcionan como obstáculos reales del tablero.

---

## 7. Estados que el jugador puede cargar

A nivel lógico, cada jugador puede necesitar varios estados persistentes relacionados con el tablero.

### Estados recomendados
- `board_position`
- `shield_charges`
- `skip_turns`
- `next_roll_bonus`
- `next_roll_max`
- `pending_minigame_key`
- `pending_minigame_tile_index`
- `pending_minigame_session_id`

### Significado
- `board_position`: posición actual en el tablero.
- `shield_charges`: escudos disponibles.
- `skip_turns`: turnos perdidos pendientes.
- `next_roll_bonus`: bonus para el próximo dado.
- `next_roll_max`: límite máximo para el próximo dado.
- `pending_minigame_key`: minijuego pendiente.
- `pending_minigame_tile_index`: casilla que causó el bloqueo.
- `pending_minigame_session_id`: sesión activa o pendiente del minijuego.

---

## 8. Flujo técnico esperado de una casilla

## 8.1 Caída simple
- el jugador lanza el dado;
- la ficha se mueve;
- al terminar el movimiento, se evalúa la casilla;
- si no tiene efecto, el turno termina.

## 8.2 Caída con efecto de movimiento
- el jugador lanza el dado;
- la ficha se mueve;
- al llegar, se evalúa la casilla;
- la casilla ordena un movimiento adicional;
- la ficha vuelve a moverse;
- al terminar, se evalúa la nueva casilla.

## 8.3 Caída en minijuego
- el jugador lanza el dado;
- la ficha se mueve;
- al terminar, se detecta la casilla de minijuego;
- se abre el minijuego;
- se obtiene resultado:
  - victoria: queda libre;
  - derrota: queda bloqueado.

---

## 9. Minijuegos definidos

## 9.1 Memory de Reliquias
### Tipo
Versus

### Idea base
Duelo 1v1 por turnos con parejas de cartas.

### Regla general
- se juega en un tablero de cartas;
- cada jugador revela dos cartas por turno;
- si forman pareja, se queda con ellas y sigue;
- si no, pasa el turno;
- gana quien consiga más pares.

### Requisitos visuales
- selección de rival;
- cartas boca abajo;
- animación de volteo;
- contador de pares;
- indicador de turno;
- resultado final.

### Requisitos de audio
- revelado de carta;
- acierto;
- fallo;
- victoria;
- derrota.

---

## 9.2 Guerra Goblin de Cartas
### Tipo
Versus

### Idea base
Duelo rápido por suma de cartas.

### Regla general
- cada jugador recibe 3 cartas;
- se suman los valores;
- gana quien tenga la suma mayor;
- en empate puede haber carta extra o regla de desempate.

### Requisitos visuales
- reparto de cartas;
- revelado claro;
- suma visible;
- resultado rápido.

### Requisitos de audio
- barajado;
- reparto;
- revelado;
- resultado.

---

## 9.3 Ruta del Pantano
### Tipo
Solo

### Idea base
Memoria espacial o seguimiento de ruta.

### Regla general
- se muestra una secuencia de pasos o nodos;
- el jugador debe repetirla correctamente;
- si falla, pierde.

### Requisitos visuales
- ruta visible;
- nodos iluminados;
- repetición por parte del jugador;
- validación paso a paso.

### Requisitos de audio
- marca de secuencia;
- confirmación de paso correcto;
- error;
- cierre.

---

## 9.4 Ritual del Tótem
### Tipo
Solo

### Idea base
Timing o precisión.

### Regla general
- el jugador debe detener una barra, aguja o marcador;
- debe caer dentro de una zona válida;
- si acierta, gana;
- si falla, pierde.

### Requisitos visuales
- barra o círculo de timing;
- zona objetivo;
- feedback de precisión.

### Requisitos de audio
- movimiento continuo;
- clic o parada;
- acierto;
- fallo.

---

## 9.5 Runas del Chamán
### Tipo
Solo

### Idea base
Secuencia tipo Simon Says.

### Regla general
- varias runas se iluminan en cierto orden;
- el jugador debe repetir exactamente esa secuencia;
- si falla, pierde.

### Requisitos visuales
- runas destacadas;
- secuencia animada;
- selección del jugador;
- validación paso a paso.

### Requisitos de audio
- activación de runas;
- input correcto;
- input incorrecto;
- cierre.

---

## 10. Requisitos generales de UI

Cada casilla o minijuego debe contemplar al menos estos estados visuales:

- `idle`
- `active`
- `resolving`
- `success`
- `fail`

En el caso de minijuegos también puede existir:
- `blocked`
- `pending_retry`

### Principio visual
La interfaz debe dejar siempre claro:
- qué tipo de casilla es,
- qué está pasando,
- si el jugador ganó o perdió,
- si el turno terminó,
- si quedó un castigo pendiente.

---

## 11. Requisitos generales de audio

Cada casilla o minijuego idealmente debe tener:

### Para casillas
- sonido de activación;
- sonido de bonus, castigo o evento;
- sonido de transición si mueve al jugador.

### Para minijuegos
- inicio;
- interacción;
- acierto;
- error;
- victoria;
- derrota.

### Recomendación
No mezclar audios largos con la fase de movimiento de ficha.  
El audio fuerte del minijuego debe arrancar cuando el minijuego ya se abrió, no mientras la ficha se mueve.

---

## 12. Recomendaciones de implementación por prioridad

Orden sugerido para convertir los prototipos actuales en versiones reales:

1. Guerra Goblin de Cartas  
2. Memory de Reliquias  
3. Ritual del Tótem  
4. Runas del Chamán  
5. Ruta del Pantano  
6. Mazo del Caos

### Motivo
- Guerra Goblin de Cartas es corto y fácil de cerrar visualmente.
- Memory de Reliquias tiene mucha identidad, pero pide más interfaz.
- Ritual del Tótem y Runas del Chamán son mecánicas bastante directas.
- Ruta del Pantano requiere una lógica visual más elaborada.
- Mazo del Caos depende de definir mejor toda la colección de cartas y efectos.

---

## 13. Criterios de terminado

Un minijuego o casilla se considera bien implementado cuando cumple:

### Entrada
- se abre desde la casilla correcta;
- solo aparece después de que la ficha termina de moverse;
- recibe los datos necesarios.

### Desarrollo
- tiene reglas claras;
- responde al input;
- muestra feedback correcto;
- evita doble ejecución.

### Salida
- devuelve victoria o derrota;
- comunica el resultado claramente.

### Integración
- actualiza el estado del jugador correctamente;
- si pierde, deja el minijuego pendiente;
- si gana, libera la casilla;
- no rompe el flujo general del tablero.

---

## 14. Resumen final

El sistema de casillas del tablero debe funcionar como una cadena de resolución visual y lógica:

- la ficha se mueve primero;
- el efecto de la casilla se ejecuta después;
- si el efecto mueve al jugador, la nueva casilla también se resuelve;
- si la casilla es de minijuego, el minijuego se abre al terminar el movimiento;
- si el jugador pierde, queda pendiente en esa casilla;
- hasta ganar ese minijuego no vuelve a lanzar dado normalmente.

Esta documentación debe usarse como base para la construcción real de:
- pantallas,
- arte,
- sonidos,
- animaciones,
- lógica de resolución,
- integración con backend y estado de partida.
