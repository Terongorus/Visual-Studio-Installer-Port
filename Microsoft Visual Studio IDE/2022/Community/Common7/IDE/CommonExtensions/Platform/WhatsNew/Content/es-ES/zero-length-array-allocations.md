---
description: La herramienta de asignación de .NET ahora identifica asignaciones de matriz de longitud cero, lo que ayuda a optimizar el uso y el rendimiento de la memoria.
area: Debugging & diagnostics
title: Información sobre asignación de matrices de longitud cero
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


La herramienta de asignación de .NET ahora proporciona información detallada sobre las asignaciones de matrices de longitud cero, lo que le ayuda a identificar y optimizar el uso innecesario de memoria. Aunque estas asignaciones pueden parecer insignificantes si se miran de forma individual, pueden ir acumulándose rápidamente y afectar al rendimiento, especialmente en aplicaciones de alto rendimiento o con limitaciones de memoria.

![Herramienta de instrumentación nativa](../media/zero-length-array-allocations.mp4)

Con esta actualización, puede investigar las asignaciones de matrices de longitud cero haciendo clic en el vínculo Investigar, que abre la vista de asignación que muestra los detalles de la asignación. Al hacer doble clic se muestran las rutas de acceso de código en las que se producen estas asignaciones, lo que permite optimizaciones precisas. Para mejorar la eficacia, considere la posibilidad de usar `Array.Empty<T>()`, una instancia de matriz vacía asignada estáticamente, para eliminar las asignaciones de memoria redundantes.
