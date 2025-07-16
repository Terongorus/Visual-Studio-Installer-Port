---
description: Vous pouvez maintenant laisser Copilot ajuster votre code collé pour qu'il s'adapte au contexte de votre code existant.
area: GitHub Copilot
title: Collage adaptatif
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Lorsque vous collez du code dans Visual Studio, des étapes supplémentaires sont souvent nécessaires pour le faire fonctionner de manière transparente. Il se peut que des paramètres doivent être ajustés pour correspondre à ceux déjà utilisés dans votre solution, ou que la syntaxe et le style ne s'alignent pas sur le reste de votre document.

Le collage adaptatif est là pour vous faire gagner du temps et réduire les efforts en ajustant automatiquement le code collé pour qu'il corresponde au contexte de votre code existant, minimisant ainsi le besoin de modifications manuelles. Cette fonctionnalité prend également en charge des scénarios tels que les corrections d'erreurs mineures, le style du code, le formatage, la traduction du langage humain et du code, ainsi que les tâches de remplissage ou de poursuite du modèle.

Par exemple, si vous avez une classe `Math` qui implémente l'interface `IMath`, copier et coller l'implémentation de la méthode `Ceiling` dans le même fichier l'adaptera pour implémenter le membre `Floor` de l'interface qui n'a pas encore été implémenté.

![Adapter la méthode collée pour compléter l'interface](../media/adaptive-paste-complete-interface.mp4)

L'interface utilisateur de collage adaptatif apparaît lorsque vous effectuez un collage normal {KeyboardShortcut:Edit.Paste}. Appuyez simplement sur la touche `TAB` pour demander une requête, et vous obtiendrez une comparaison entre le code collé original et le code adapté.

Essayez-le dès aujourd'hui en activant l'option **Outils > Options > GitHub > Copilot > Éditeur > Activer le collage adaptatif**.

### Vous voulez essayer ?
Activez GitHub Copilot Gratuit et déverrouillez cette fonctionnalité d’IA parmi d’autres.
 Pas de version d’évaluation. Pas de carte de crédit. Juste votre compte GitHub. [Obtenez Copilot Gratuit](https://github.com/settings/copilot).
