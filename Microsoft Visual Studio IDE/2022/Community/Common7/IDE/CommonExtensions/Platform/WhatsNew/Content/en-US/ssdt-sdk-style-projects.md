---
description: You can now use the SDK-style project file format in your SQL Server Data Tools projects with enhanced SQL debugging and schema comparison capabilities.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Use SDK-style SQL projects in SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


The update in Visual Studio 17.14 introduces new item templates and .dacpac database references to SDK-style SQL Server Data Tools (preview). SDK-style SSDT SQL projects are based on the Microsoft.Build.Sql SDK, which provides cross-platform support and improved CI/CD capabilities for SQL Server Data Tools (SSDT) projects.

With less verbose project files and database references to NuGet packages, teams can collaborate more efficiently on large databases within a single project or compile multiple sets of objects from several projects. Database deployments from a Microsoft.Build.Sql project can be automated in both Windows and Linux environments using the Microsoft.SqlPackage dotnet tool to publish the build artifact (.dacpac) from the SQL project. Learn more about [SDK-style SQL projects and DevOps for SQL](https://aka.ms/sqlprojects).

![Adding a database reference in SDK-style SQL Server Data Tools](../media/ssdt_sdk_preview_database_reference.png)

In 17.14, [database references](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) have been expanded to support project and .dacpac artifact references. Support for database references as package references will be available in a future release. A recent update to the [slngen solution file generator](https://github.com/microsoft/slngen) also added support for Microsoft.Build.Sql projects, enabling the management of large solutions programmatically.

To use SDK-style SQL projects in your solution, make sure to install the latest SSDT preview component in the Visual Studio installer.

![Installer enable preview SSDT feature](../media/ssdt_preview_installer.png)
