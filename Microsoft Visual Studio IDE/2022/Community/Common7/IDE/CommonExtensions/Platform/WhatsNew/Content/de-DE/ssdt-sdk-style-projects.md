---
description: Sie können jetzt das Projektdateiformat im SDK-Stil in Ihren SQL Server Data Tools (SSDT)-Projekten mit erweiterten Funktionen für das SQL-Debuggen und den Schemavergleich verwenden.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Verwenden von SQL-Projekten im SDK-stil in SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Das Update in Visual Studio 17.14 führt neue Elementvorlagen und .dacpac-Datenbankreferenzen für SQL Server Data Tools im SDK-Stil ein (Vorschau). SSDT SQL-Projekte im SDK-Stil basieren auf dem Microsoft.Build.Sql SDK, das plattformübergreifende Unterstützung und verbesserte CI/CD-Funktionen für SQL Server Data Tools (SSDT) Projekte bietet.

Mit weniger ausführlichen Projektdateien und Datenbankverweisen auf NuGet-Pakete können Teams effizienter an großen Datenbanken innerhalb eines einzigen Projekts zusammenarbeiten oder mehrere Objektsätze aus verschiedenen Projekten kompilieren. Datenbankbereitstellungen aus einem Microsoft.Build.Sql-Projekt können sowohl in Windows- als auch in Linux-Umgebungen automatisiert werden. Verwenden Sie dazu das dotnet-Tool Microsoft.SqlPackage, um das Build-Artefakt (.dacpac) aus dem SQL-Projekt zu veröffentlichen. Erfahren Sie mehr über [SQL-Projekte im SDK-Format und DevOps für SQL](https://aka.ms/sqlprojects).

![Hinzufügen einer Datenbankreferenz in den SQL Server Data Tools im SDK-Stil](../media/ssdt_sdk_preview_database_reference.png)

In 17.14 wurden [Datenbankreferenzen](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) erweitert, um Projekt- und .dacpac-Artefaktreferenzen zu unterstützen. Unterstützung für Datenbankreferenzen als Paketreferenzen wird in einer zukünftigen Version verfügbar sein. Ein kürzlich durchgeführtes Update des [slngen solution file generator](https://github.com/microsoft/slngen) hat auch Unterstützung für Microsoft.Build.Sql-Projekte hinzugefügt, wodurch die Verwaltung großer Lösungen programmatisch ermöglicht wird.

Um SQL-Projekte im SDK-Stil in Ihrer Lösung zu verwenden, stellen Sie sicher, dass Sie die neueste SSDT-Vorschaukomponente im Visual Studio Installer installieren.

![Installationsprogramm aktiviert das SSDT-Vorschaufeature](../media/ssdt_preview_installer.png)
