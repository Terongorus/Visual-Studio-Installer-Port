---
description: L’outil d’allocation .NET identifie désormais les allocations de tableaux de longueur zéro, ce qui permet d’optimiser l’utilisation de la mémoire ainsi que les performances.
area: Debugging & diagnostics
title: Insights sur l’allocation de tableaux de longueur zéro
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


L’outil d’allocation .NET fournit désormais des insights détaillés sur les allocations de tableaux de longueur zéro, ce qui vous permet d’identifier et d’optimiser la mémoire utilisée de manière superflue. Bien que ces allocations puissent sembler insignifiantes individuellement, elles peuvent s'accumuler rapidement et avoir un impact sur les performances, en particulier dans les applications à hautes performances ou à mémoire restreinte.

![Outil d’instrumentation native](../media/zero-length-array-allocations.mp4)

Avec cette mise à jour, vous pouvez examiner les allocations de tableaux de longueur zéro en cliquant sur le lien Examiner, ce qui ouvre la vue d’allocation affichant les détails de l’allocation. Un double-clic révèle les chemins de code où ces allocations se produisent, ce qui permet des optimisations précises. Pour améliorer l’efficacité, envisagez d’utiliser `Array.Empty<T>()`, une instance de tableau vide allouée statiquement, afin d’éliminer les allocations de mémoire redondantes.
