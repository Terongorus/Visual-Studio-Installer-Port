---
description: Vous pouvez maintenant laisser Copilot implémenter entièrement votre méthode C# vide.
area: GitHub Copilot
title: Mettre en œuvre avec Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Aujourd'hui, si vous faites référence à une méthode dans votre code C# qui n'a pas encore été implémentée, vous pouvez utiliser une refactorisation courante appelée **Générer une méthode** pour créer immédiatement cette méthode dans une classe. Cependant, cette refactorisation ne crée qu'une méthode avec la signature correcte, mais un squelette vide et `throw new NotImplementedException` lignes par ailleurs. Cela signifie que, bien que la méthode existe techniquement et que vous ayez moins de travail à effectuer pour la créer, vous devrez tout de même l'implémenter vous-même, ce qui peut prendre plus de temps.

La refactorisation « **Implement with Copilot** » vise à vous rendre encore plus productif dans ce scénario en vous permettant d'implémenter ou *d'ajouter automatiquement le contenu* de votre méthode à l'aide de GitHub Copilot. Lorsque vous rencontrez une méthode vide contenant uniquement un throw `NotImplementedException`, vous pouvez sélectionner l'ampoule (`CTRL+.`) sur cette ligne `throw` et sélectionner la refactorisation **Implement with Copilot**. Copilot remplira alors tout le contenu de votre méthode en fonction de votre base de code existante, du nom de la méthode, etc.

![Mettre en œuvre avec Copilot](../media/implement-with-copilot.mp4)

### Vous voulez essayer ?
Activez GitHub Copilot Gratuit et déverrouillez cette fonctionnalité d’IA parmi d’autres.
 Pas de version d’évaluation. Pas de carte de crédit. Juste votre compte GitHub. [Obtenez Copilot Gratuit](https://github.com/settings/copilot).
