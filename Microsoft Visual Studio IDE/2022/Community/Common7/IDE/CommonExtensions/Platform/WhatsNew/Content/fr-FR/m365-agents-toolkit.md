---
description: Mises à jour GA de Teams Toolkit 17.14.
area: IDE
title: Kit de ressources Agents Microsoft 365
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


Nous sommes ravis d’annoncer que notre produit, précédemment connu sous le nom de Teams Toolkit, est renommé Microsoft 365 Agents Toolkit. Ce changement reflète notre volonté et notre engagement à prendre en charge un plus large éventail de plateformes et de types de projets au sein de l’écosystème Microsoft 365.

À mesure que nous continuons d’améliorer notre produit, nous passons d’une prise en charge exclusive du développement Teams à une offre visant à permettre aux développeurs de créer des agents Microsoft 365 Copilot et d’autres applications sur la plateforme Microsoft 365. Ces plateformes incluent Microsoft 365 Copilot, Microsoft Teams, la famille Office et Outlook. Cette extension de l’étendue nous permet de mieux servir nos utilisateurs en leur fournissant des outils, des modèles et des ressources complets pour développer une grande variété de solutions Microsoft 365.

Le nouveau nom, Microsoft 365 Agents Toolkit, reflète mieux les fonctionnalités et capacités diverses de notre produit. Nous pensons que ce changement aidera nos utilisateurs à identifier plus facilement l’ensemble des opportunités de développement disponibles dans l’environnement Microsoft 365.

Nous vous remercions de votre soutien continu alors que nous évoluons pour répondre aux besoins croissants de notre communauté de développeurs.


### Créer un agent déclaratif 

Nous sommes ravis d’annoncer que dans cette version, nous avons ajouté des modèles de projet pour créer des agents déclaratifs pour Microsoft 365 Copilot.

![Créer un projet DA](../media/atk_da_create.png)

Vous pouvez créer un agent déclaratif avec ou sans action. Vous pouvez choisir de définir de nouvelles API ou d’utiliser les API existantes pour effectuer des tâches ou récupérer des données.

Utilisez Microsoft 365 Agents Toolkit pour déboguer et prévisualiser vos agents déclaratifs dans Microsoft Copilot.

### Activation du débogage en un seul clic
Dans les versions précédentes de Teams Toolkit, désormais appelé Microsoft 365 Agents Toolkit, lorsque les utilisateurs déboguaient une solution générée, vous deviez utiliser la **commande Préparer la dépendance** de l’application Teams avant de déboguer le projet. Cette commande déclenchait le kit de développement pour aider les développeurs à créer des ressources essentielles au débogage, telles que l’enregistrement ou la mise à jour de l’application Teams.

Pour améliorer l’expérience de débogage et la rendre plus intuitive pour les utilisateurs de Visual Studio, nous avons supprimé cette étape et activé l’expérience de débogage en un clic. Désormais, vous pouvez cliquer directement sur le bouton de débogage sans aucune étape de préparation. Toutefois, si vous avez apporté des modifications au manifeste de votre application entre deux événements de débogage et que vous devez mettre à jour votre application, vous disposez toujours d’une option pour le faire.
Nous vous proposons deux profils de débogage :

![profils de débogage](../media/atk_debug_profiles.png)

- **Déboguer avec mise à jour de l’application :** sélectionnez le profil par défaut `[Your Target Launch Platform] (browser)` si vous avez apporté des modifications à votre application afin de vous assurer que les mises à jour sont appliquées.
- **Déboguer sans mettre à jour l’application :** choisissez le deuxième profil `[Your Target Launch Platform] (browser) (skip update app) ` pour ignorer la mise à jour des ressources de l’application, ce qui rend le débogage plus léger et plus rapide.

### Mettre à niveau vers .NET 9

De plus, dans cette version, nous avons actualisé tous les modèles de projet pour prendre en charge .NET 9.

![Prise en charge de .net9](../media/atk_net9.png)

**Codez bien !**  
*L’équipe Microsoft 365 Agents Toolkit*
