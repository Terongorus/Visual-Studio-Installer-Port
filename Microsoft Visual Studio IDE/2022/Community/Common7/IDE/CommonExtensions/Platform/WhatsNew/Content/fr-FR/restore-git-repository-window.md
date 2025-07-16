---
description: Ce nouveau paramètre permet de conserver la fenêtre Dépôt Git ouverte entre les redémarrages.
area: Git tooling
title: Restaurer la fenêtre Dépôt Git
thumbnailImage: ../media/restore-git-repository-window-thumbnail.png
featureId: restoregitrepositorywindow
devComUrl: https://developercommunity.visualstudio.com/t/Git-Repository-window-is-not-restored-in/1255797

---


En tant qu’environnement dédié pour les opérations de branche, la [fenêtre Dépôt Git](vscmd://Team.Git.GoToGitSynchronization) {KeyboardShortcut:Team.Git.GoToGitSynchronization} est probablement au cœur de votre développement quotidien. Si vous vous retrouvez à la rouvrir fréquemment à chaque session Visual Studio, cette mise à jour est conçue pour vous faire gagner du temps et des efforts.

![Liste des branches de la fenêtre Dépôt Git.](../media/restore-git-repository-window-thumbnail.png)

Nous avons ajouté un nouveau paramètre à[ Git > Settings](vscmd://Team.Git.Settings) qui restaure automatiquement la fenêtre du référentiel Git lors du redémarrage de Visual Studio. En outre, la fenêtre sera incluse dans vos dispositions de fenêtre enregistrées, améliorant ainsi vos options de personnalisation.

Par défaut, cette fonctionnalité est désactivée pour maintenir un bon fonctionnement pour ceux qui n’en ont pas besoin. Mais si vous aimez ce qui est pratique, ce paramètre est parfait pour vous.

![Page Paramètres Git avec la case à cocher Restaurer la fenêtre Dépôt Git.](../media/restore-git-repository-window-setting.png)
