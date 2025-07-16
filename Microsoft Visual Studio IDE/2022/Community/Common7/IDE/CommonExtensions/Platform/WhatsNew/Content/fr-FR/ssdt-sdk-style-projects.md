---
description: Vous pouvez désormais utiliser le format de fichier de projet de style SDK dans vos projets SQL Server Data Tools avec des fonctionnalités de débogage SQL et de comparaison de schémas améliorées.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Utilisez des projets SQL de type SDK dans SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


La mise à jour dans Visual Studio 17.14 introduit de nouveaux modèles d'éléments et des références de base de données .dacpac pour les outils de données SQL Server de style SDK (préversion). Les projets SQL Server de style SDK sont basés sur le SDK Microsoft.Build.Sql, qui offre une prise en charge multiplateforme et des capacités CI/CD améliorées pour les projets d'outils de données SQL Server (SSDT).

Avec des fichiers de projet moins détaillés et des références de base de données aux packages NuGet, les équipes peuvent collaborer plus efficacement sur de grandes bases de données au sein d'un seul projet ou compiler plusieurs ensembles d'objets provenant de plusieurs projets. Les déploiements de bases de données à partir d'un projet Microsoft.Build.Sql peuvent être automatisés dans les environnements Windows et Linux à l'aide de l'outil Microsoft.SqlPackage dotnet pour publier l'artefact de construction (.dacpac) du projet SQL. Pour en savoir plus sur les [projets SQL de style SDK et DevOps pour SQL](https://aka.ms/sqlprojects).

![Ajout d’une référence de base de données dans SQL Server Data Tools de style SDK](../media/ssdt_sdk_preview_database_reference.png)

Dans la version 17.14, les [références aux bases de données](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) ont été étendues pour prendre en charge les références aux artefacts .dacpac et aux projets. La prise en charge des références de base de données en tant que références de package sera disponible dans une prochaine version. Une récente mise à jour du [générateur de fichiers de solution slngen](https://github.com/microsoft/slngen) a également ajouté la prise en charge des projets Microsoft.Build.Sql, ce qui permet de gérer de grandes solutions de manière programmatique.

Pour utiliser des projets SQL de type SDK dans votre solution, assurez-vous d'installer le dernier composant de préversion SSDT dans le programme d'installation de Visual Studio.

![Le programme d’installation permet la préversion de la fonctionnalité SSDT](../media/ssdt_preview_installer.png)
