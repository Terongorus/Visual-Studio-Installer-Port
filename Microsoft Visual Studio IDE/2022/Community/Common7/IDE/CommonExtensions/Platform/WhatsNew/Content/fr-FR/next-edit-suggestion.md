---
description: NES s'appuie sur les modifications précédentes et prédit la prochaine modification à venir, qu'il s'agisse d'une insertion, d'une suppression ou d'un mélange des deux.
area: GitHub Copilot
title: Suggestion d'édition suivante
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Nous sommes heureux d'annoncer que Next Edit Suggestions, ou NES en abrégé, est désormais disponible dans Visual Studio afin d'améliorer votre expérience de codage. NES s'appuie sur les modifications précédentes et prédit la prochaine modification à venir, qu'il s'agisse d'une insertion, d'une suppression ou d'un mélange des deux. Contrairement à la fonction « Complétions », qui se limite à générer des suggestions à l'emplacement du curseur, NES peut vous assister n'importe où dans votre fichier, là où la prochaine modification est la plus susceptible d'avoir lieu. NES améliore l'expérience existante de Saisies semi-automatiques Copilot en soutenant les activités d'édition de code des développeurs.

### Bien démarrer avec NES
Activez NES via **Outils > Options > GitHub > Copilot > Saisies semi-automatiques Copilot > Activer les suggestions de la prochaine midification.**

Comme pour les complétions, tout ce que vous devez faire pour obtenir NES est de commencer à coder !

Lorsqu'une suggestion d'édition vous est présentée, si elle se trouve sur une ligne différente de celle sur laquelle vous êtes actuellement, il vous sera suggéré de **Tabuler pour naviguer d'abord vers la ligne correspondante.** Vous n'aurez plus besoin de chercher manuellement les modifications correspondantes ; NES vous guidera !

 ![Barre d'indices « Tab to Jump » de NES](../media/NES-Tab-Jump.png)

Une fois que vous êtes sur la même ligne que l'édition, vous pouvez utiliser la touche **Tab pour accepter** la suggestion.

  ![Barre d'indices NES pour l'acceptation de la tabulation](../media/NES-Tab-Accept.png)

Note : Vous pouvez activer ou désactiver les barres d'indices **en allant dans Outils > Options > IntelliCode > Avancé > Masquer le conseil affiché avec du texte gris**. 

En plus des barres d'indication, une flèche dans la gouttière apparaît également pour indiquer qu'une suggestion d'édition est disponible. Vous pouvez cliquer sur la flèche pour explorer le menu des suggestions d'édition.

  ![Flèche de la gouttière NES](../media/NES-Gutter-Arrow.png)


### Exemples de scénarios
Les suggestions d'édition suivantes peuvent s'avérer utiles dans de nombreux cas, non seulement pour apporter des modifications répétitives évidentes, mais aussi pour effectuer des changements logiques. Voici quelques exemples :

**Refonte d'une classe de point 2D en point 3D :**
 
![Refonte d'une classe de point NES](../media/NES-Point.mp4)

**Mise à jour de la syntaxe du code vers le C++ moderne en utilisant STL :**

Notez que NES ne se contente pas d'effectuer des changements répétitifs tels que la mise à jour de tous les `printf()` en `std::cout`, mais met également à jour d'autres syntaxes telles que `fgets()`.

![Mise à jour de la syntaxe du C++ par NES](../media/NES-Migration.mp4)

**Effectuer des changements logiques en réponse à une nouvelle variable ajoutée :**

NES réagit rapidement à la nouvelle variable, qui ajoute un nombre maximum de suppositions qu'un joueur peut faire dans un jeu, et Saisies semi-automatiques Copilot intervient également pour aider.

![NES ajoute une nouvelle variable](../media/NES-AddVariable.mp4)

### Vous voulez essayer ?
Activez GitHub Copilot Gratuit et déverrouillez cette fonctionnalité d’IA parmi d’autres.
 Pas de version d’évaluation. Pas de carte de crédit. Juste votre compte GitHub. [Obtenez Copilot Gratuit](https://github.com/settings/copilot).
