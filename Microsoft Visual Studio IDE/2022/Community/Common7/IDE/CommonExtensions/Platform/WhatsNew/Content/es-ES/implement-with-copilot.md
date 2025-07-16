---
description: Ahora puede dejar que Copilot implemente completamente su método C# vacío.
area: GitHub Copilot
title: Implementación con Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Hoy en día, si está haciendo referencia a un método en su código C# que aún no ha sido implementado, puede usar una refactorización de bombilla común llamada **Generar Método** para crear inmediatamente ese método en una clase. Sin embargo, esta refactorización no solo crea un método con la firma correcta, sino que, en caso contrario, crea un esqueleto vacío y una línea `throw new NotImplementedException`. Esto significa que, aunque el método técnicamente existe y tiene que hacer menos trabajo para crearlo, seguirá necesitando implementar el método usted mismo, lo que puede llevarle más tiempo.

La refactorización **Implementar con Copilot** pretende hacerle aún más productivo en este escenario permitiéndole implementar automáticamente o *añadir la carne* a su método con la ayuda de GitHub Copilot. Cuando se encuentra un método vacío que solo contiene un lanzamiento `NotImplementedException`, puede seleccionar la bombilla (`CTRL+.`) en esa línea `throw` y seleccionar la refactorización **Implementar con Copilot** y Copilot rellenará todo el contenido de su método basándose en su codebase existente, nombre del método, etc.

![Implementación con Copilot](../media/implement-with-copilot.mp4)

### ¿Quiere probarlo?
Active GitHub Copilot Free y descubra esta característica de IA, además de muchas más.
 Sin pruebas. Sin tarjeta de crédito. Solo con la cuenta de GitHub. [Obtenga Copilot Free](https://github.com/settings/copilot).
