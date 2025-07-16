---
description: Ahora puede usar el formato de archivo de proyecto de estilo SDK en los proyectos de SQL Server Data Tools con capacidades mejoradas de depuración de SQL y comparación de esquemas.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Uso de proyectos de SQL de estilo SDK en SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


La actualización en Visual Studio 17.14 incluye plantillas de elementos adicionales y referencias de base de datos .dacpac a SQL Server Data Tools (versión preliminar) de tipo SDK. Los proyectos SSDT SQL de tipo SDK están basados en el SDK Microsoft.Build.Sql, que ofrece compatibilidad multiplataforma y funcionalidades CI/CD mejoradas para proyectos SQL Server Data Tools (SSDT).

Con archivos de proyecto menos detallados y referencias de base de datos a paquetes NuGet, los equipos pueden colaborar de forma más eficaz en bases de datos grandes dentro de un solo proyecto, o compilar varios conjuntos de objetos de varios proyectos. Las implementaciones de base de datos de un proyecto Microsoft.Build.Sql se pueden automatizar tanto en entornos Windows como Linux usando la herramienta dotnet de Microsoft.SqlPackage para publicar el artefacto de compilación (.dacpac) desde el proyecto SQL. Obtenga más información sobre [proyectos SQL de estilo SDK y DevOps para SQL](https://aka.ms/sqlprojects).

![Agregar una referencia de base de datos en SQL Server Data Tools de estilo SDK](../media/ssdt_sdk_preview_database_reference.png)

En la versión 17.14, las [referencias de base de datos](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) se han ampliado para admitir referencias de proyectos y de artefactos .dacpac. La compatibilidad con referencias de base de datos como referencias de paquetes estará disponible en una futura versión. Una actualización reciente del [generador de archivos de solución SlnGen](https://github.com/microsoft/slngen) incluyó también compatibilidad con proyectos Microsoft.Build.Sql, lo que permite administrar soluciones de gran tamaño mediante programación.

Para poder utilizar proyectos SQL de estilo SDK en las soluciones hay que asegurarse de instalar el componente de vista previa SSDT más reciente en el instalador de Visual Studio.

![Característica de SSDT de habilitación de la versión preliminar del instalador](../media/ssdt_preview_installer.png)
