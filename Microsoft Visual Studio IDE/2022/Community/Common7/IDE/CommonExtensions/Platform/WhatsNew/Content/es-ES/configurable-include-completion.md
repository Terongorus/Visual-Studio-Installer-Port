---
description: La configuración de la finalización Incluir permite controlar qué encabezados aparecen en la lista de finalización.
area: C++
title: Finalización Incluir configurable
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Ahora se pueden controlar los encabezados en la lista de finalización Incluir escribiendo `#include`.

La opción desplegable en **Herramientas > Opciones > Editor de texto > C/C++ > IntelliSense > Incluir estilo para sugerencias** ahora afecta tanto a las sugerencias de Incluir como al completado con Incluir, con las siguientes acciones específicas:

- **Directrices básicas (predeterminado)**: usa comillas para rutas de acceso relativas y corchetes angulares para todo lo demás.
- **Comillas**: usa comillas para todos los encabezados excepto los encabezados estándar, que usan corchetes angulares.
- **Corchetes angulares**: se usan corchetes angulares para todos los encabezados que forman parte de la ruta de acceso Incluir.

![Estilo de Incluir para la configuración de sugerencias](../media/IncludeStyleSuggestionsSetting.png)

Anteriormente, todos los encabezados (excepto los relativos) aparecían en sugerencias, fuera cual fuera la sintaxis usada. Con esta actualización, se puede especificar más en detalle cómo aparecerán las sugerencias de encabezados al usar `#include <> and #include ""`.
