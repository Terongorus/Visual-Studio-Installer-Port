---
description: Nyní můžete ve svých projektech SQL Server Data Tools používat formát souboru projektu ve stylu SDK s vylepšenými funkcemi ladění SQL a porovnávání schémat.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Používání projektů SQL ve stylu SDK v SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Aktualizace v sadě Visual Studio 17.14 zavádí nové šablony položek a odkazy na databáze .dacpac na SQL Server Data Tools ve stylu sady SDK (Preview). Projekty SSDT SQL jsou založené na sadě SDK projektu Microsoft.Build.Sql, což poskytuje podporu pro různé platformy a vylepšené funkce CI/CD pro projekty SQL Server Data Tools (SSDT).

Díky méně podrobným souborům projektu a databázovým odkazům na balíčky NuGet můžou týmy efektivněji spolupracovat na velkých databázích v rámci jednoho projektu nebo kompilovat více sad objektů z několika projektů. Nasazení databází z projektu Microsoft.Build.Sql je možné automatizovat v prostředích s Windows i Linuxem, kde nástroj Microsoft.SqlPackage dotnet publikuje z projektu SQL artefakt sestavení (.dacpac). Přečtěte si další informace o [projektech SQL ve stylu SDK a DevOps pro SQL](https://aka.ms/sqlprojects).

![Přidání odkazu na databázi v SQL Server Data Tools ve stylu sady SDK](../media/ssdt_sdk_preview_database_reference.png)

Ve verzi 17.14 byly [odkazy na databáze](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) rozšířeny tak, aby podporovaly odkazy na artefakty projektu a .dacpac. Podpora odkazů na databáze, protože odkazy na balíčky budou k dispozici v budoucí verzi. Nedávná aktualizace [generátoru souborů řešení slngen](https://github.com/microsoft/slngen) také přidala podporu projektů Microsoft.Build.Sql, která umožňuje programově spravovat rozsáhlá řešení.

Pokud chcete ve svém řešení používat projekty SQL ve stylu SDK, nezapomeňte do instalačního programu sady Visual Studio nainstalovat nejnovější součást SSDT ve verzi Preview.

![Instalační program s povolenou funkcí SSDT ve verzi Preview](../media/ssdt_preview_installer.png)
