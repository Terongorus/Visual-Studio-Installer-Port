---
description: Теперь в проектах SQL Server Data Tools можно использовать формат файла проекта в стиле пакета SDK с улучшенными возможностями отладки SQL и сравнения схем.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Использование проектов SQL в стиле пакета SDK в SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


В обновлении Visual Studio 17.14 впервые представлены новые шаблоны элементов и ссылки на базу данных DACPAC, добавленные в инструменты SQL Server Data Tools в стиле пакета SDK (предварительной версии). Проекты SSDT SQL в стиле пакета SDK основаны на пакете Microsoft.Build.Sql SDK, который предоставляет межплатформенную поддержку и обеспечивает улучшенные возможности CI/CD для проектов SQL Server Data Tools (SSDT).

С менее подробными файлами проектов и ссылками базы данных на пакеты NuGet команды могут более эффективно совместно работать над большими базами данных в рамках одного проекта или компилировать несколько наборов объектов из нескольких проектов. Развертывание баз данных из проекта Microsoft.Build.Sql можно автоматизировать как в среде Windows, так и в Linux, используя средство dotnet Microsoft.SqlPackage для публикации артефакта сборки (DACPAC) из проекта SQL. Подробнее о [проектах SQL в стиле пакета SDK и DevOps для SQL](https://aka.ms/sqlprojects).

![Добавление ссылок на базу данных DACPAC в инструменты SQL Server Data Tools в стиле пакета SDK](../media/ssdt_sdk_preview_database_reference.png)

В версии 17.14 [ссылки на базу данных](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) были расширены — в них также вошли ссылки на проекты и артефакты DACPAC. Поддержка ссылок на базы данных в формате ссылок на пакеты будет реализована в будущем. В недавнем обновленном выпуске [генератора файлов решений slngen](https://github.com/microsoft/slngen) также была добавлена поддержка проектов Microsoft.Build.Sql, позволяющая управлять большими решениями программно.

Чтобы использовать проекты SQL в стиле пакета SDK в своем решении, установите новейший компонент предварительной версии SSDT в установщике Visual Studio.

![Установщик включает предварительную версию функции SSDT](../media/ssdt_preview_installer.png)
