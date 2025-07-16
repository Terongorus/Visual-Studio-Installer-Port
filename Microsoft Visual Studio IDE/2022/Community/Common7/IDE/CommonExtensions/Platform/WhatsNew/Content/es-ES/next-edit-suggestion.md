---
description: NES aprovecha las ediciones realizadas anteriormente y predice la próxima edición que se va a realizar, ya sea una inserción, una eliminación o una combinación de ambas.
area: GitHub Copilot
title: Next Edit Suggestion
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Nos complace anunciar que Next Edit Suggestions (o NES, para abreviar) se encuentra ya disponible en Visual Studio, para así mejorar aún más la experiencia de codificación. NES aprovecha las ediciones realizadas anteriormente y predice la próxima edición que se va a realizar, ya sea una inserción, una eliminación o una combinación de ambas. A diferencia de Completions, que se limita a generar sugerencias en su ubicación de intercalación, NES puede proporcionarle ayuda en cualquier lugar del archivo, en aquel en el que sea más probable que se produzca la próxima edición. NES mejora la experiencia existente de finalizaciones de Copilot al facilitar las actividades de edición de código de los desarrolladores.

### Introducción a NES
Habilite NES a través de **Herramientas > Opciones > GitHub > Copilot > Finalizaciones de Copilot > Habilitar sugerencias de edición siguiente.**

¡Al igual que para las finalizaciones, todo lo que debe hacer para obtener NES es empezar a generar código!

Cuando se le presente una sugerencia de edición, si esta se encuentra en una línea diferente a la que está en ese momento, pulsar **Tab para ir primero a la línea** de la que se trate. Ya no tendrá que buscar manualmente ediciones relacionadas; ¡NES le guiará en ese camino!

 ![Pestaña NES para saltar a barra de sugerencias](../media/NES-Tab-Jump.png)

Una vez que ya se encuentre situado en la misma línea que la edición, puede **Tabular para aceptar** la sugerencia.

  ![Barra de sugerencias Tab to Accept NES](../media/NES-Tab-Accept.png)

Nota: Para activar o desactivar las barras de sugerencias, vaya a **Herramientas > Opciones > IntelliCode > Opciones avanzadas > Ocultar la sugerencia que se muestra con texto gris**. 

Además de las barras de sugerencias, también aparece una flecha para indicar que se encuentra disponible una sugerencia de edición. Puede hacer clic en la flecha para explorar el menú de sugerencias de ediciones.

  ![Flecha acanalada NES](../media/NES-Gutter-Arrow.png)


### Escenarios de ejemplo
Next Edit Suggestions puede ser útil en una gran variedad de escenarios, no solo realizar cambios repetitivos obvios, sino también cambios lógicos. Estos son algunos ejemplos:

**Refactorización de una clase punto 2D a punto3D:**
 
![Clase punto de refactorización NES](../media/NES-Point.mp4)

**Actualización de la sintaxis de código a C++ moderno mediante STL:**

Tenga en cuenta que NES no solo está realizando cambios repetitivos, como actualizar `printf()` a `std::cout`, sino también actualizar otra sintaxis como `fgets()`.

![Sintaxis de actualización de C++ de NES](../media/NES-Migration.mp4)

**Realizar cambios lógicos en respuesta a una variable recién añadida:**

NES responde rápidamente a la nueva variable, que añade un número máximo de intentos que un jugador puede realizar en un juego, y las finalizaciones de Copilot también entran en funcionamiento para ayudar.

![Adición de variables nuevas NES](../media/NES-AddVariable.mp4)

### ¿Quiere probarlo?
Active GitHub Copilot Free y descubra esta característica de IA, además de muchas más.
 Sin pruebas. Sin tarjeta de crédito. Solo con la cuenta de GitHub. [Obtenga Copilot Free](https://github.com/settings/copilot).
