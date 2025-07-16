---
description: La configuration de l'achèvement de l'inclusion vous permet de contrôler quels en-têtes apparaissent dans la liste d'achèvement de l'inclusion.
area: C++
title: Achèvement de l'inclusion configurable
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Vous pouvez désormais contrôler les en-têtes qui apparaissent dans la liste d'inclusion lorsque vous tapez `#include`.

Le paramètre déroulant dans **Outils > Options > Éditeur de texte > C/C++ > IntelliSense > Inclure le style des suggestions** affecte maintenant à la fois les suggestions d'inclusion et l'achèvement de l'inclusion, avec les comportements affinés suivants :

- **Recommandations principales (par défaut)**  : utilise des guillemets pour les chemins relatifs et des crochets pour tout le reste.
- **Guillemets** : utilise les guillemets pour tous les en-têtes, à l'exception des en-têtes standard, qui utilisent des crochets.
- **Équerres** : utilise des équerres pour tous les en-têtes qui font partie du chemin d'inclusion.

![Inclure le style pour le paramètre Suggestions](../media/IncludeStyleSuggestionsSetting.png)

Auparavant, tous les en-têtes (à l'exception des en-têtes relatifs) apparaissaient dans les suggestions, quelle que soit la syntaxe utilisée. Avec cette mise à jour, vous pouvez affiner la façon dont les suggestions d'en-têtes apparaissent lorsque vous utilisez `#include <> and #include ""`.
