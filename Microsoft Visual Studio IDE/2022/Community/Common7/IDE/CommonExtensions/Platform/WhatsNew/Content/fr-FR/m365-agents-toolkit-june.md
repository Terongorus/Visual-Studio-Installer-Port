---
description: Mises à jour de la version 17.14 GA de juin de la boîte à outils Agents.
area: IDE
title: Microsoft 365 Agents Toolkit - Juin
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: TeamstoolkitJune

---


La version de juin contient plusieurs correctifs pour la version 17.14 GA :

- Activation du lancement et de la préversion de l’agent Custom Engine dans Microsoft 365 Copilot

Un modèle d’agent Custom Engine est disponible dans notre boîte à outils. Il s’agit de l’agent Weather. Nous avons mis à jour ce modèle afin qu’il puisse être lancé et prévisualisé dans le chat Microsoft 365 Copilot. Pour l’essayer, sélectionnez simplement le profil de lancement Copilot lors du débogage. 

- Correction d’une fenêtre contextuelle d’erreur qui s’affichait lorsque le débogage échouait avec l’installation de Microsoft 365 Agents playground. Désormais, la boîte à outils affiche un message clair et des instructions pour résoudre le problème.

- Mise à niveau des modèles [Dépendance du manifeste de l’application vers la version v1.21](https://developer.microsoft.com/json-schemas/teams/v1.22/MicrosoftTeams.schema.json)

- Plusieurs bogues dans le fichier README des modèles introduits par nos nouveaux changements de marque ont été corrigés.

- Mise à jour de l’icône de la boîte à outils dans le gestionnaire d’extensions.

- Correction du problème lors du lancement d’Agents Playground : la valeur ID de chaîne requise n’autorisait que msteams et emulator. Elle autorise désormais d’autres valeurs telles que webchat.
