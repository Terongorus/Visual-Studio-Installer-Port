---
description: Ahora se puede permitir que Copilot ajuste el código pegado para así ajustarse al contexto del código existente.
area: GitHub Copilot
title: Pegar adaptable
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Al pegar código en Visual Studio, a menudo se requieren pasos adicionales para que funcione sin problemas. Es posible que sea necesario ajustar los parámetros para que coincidan con aquellos que ya se usan en la solución, porque posible que la sintaxis y el estilo no se alineen con el resto del documento.

El pegado adaptable está para ahorrarle tiempo y reducir el esfuerzo, ajustando automáticamente el código pegado para que se integre en el contexto del código existente, lo que minimiza la necesidad de modificaciones manuales. Esta funcionalidad también admite escenarios como correcciones de errores menores, estilos de codificación, formato, traducción de lenguaje humano y de código y tareas de relleno de blancos o de continuar con el patrón.

Por ejemplo, si tiene una clase `Math` que implementa la interfaz `IMath`, el copiar y pegar la implementación para el método `Ceiling` en el mismo archivo lo adaptará para implementar el miembro de interfaz `Floor`aún no implementado.

![Adaptación del método pegado para completar la interfaz](../media/adaptive-paste-complete-interface.mp4)

La interfaz de usuario de pegado adaptable aparecerá cuando realice un pegado normal {KeyboardShortcut:Edit.Paste}. Simplemente presione la tecla `TAB` para pedir una sugerencia y se le mostrarán las diferencias entre el código original pegado y el código ajustado.

Pruébelo hoy habilitando la opción **Herramientas > Opciones > GitHub > Copilot > Editor > Habilitar pegado adaptable**.

### ¿Quiere probarlo?
Active GitHub Copilot Free y descubra esta característica de IA, además de muchas más.
 Sin pruebas. Sin tarjeta de crédito. Solo con la cuenta de GitHub. [Obtenga Copilot Free](https://github.com/settings/copilot).
