---
description: È ora possibile usare il formato di file di progetto in stile SDK nei progetti SQL Server Data Tools con funzionalità avanzate di debug SQL e confronto schemi.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: Usare progetti SQL in stile SDK in SSDT
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


L'aggiornamento in Visual Studio 17.14 introduce nuovi modelli di elemento e riferimenti di database .dacpac a SQL Server Data Tools in stile SDK (anteprima). I progetti SQL SSDT in stile SDK sono basati su Microsoft.Build.Sql SDK, che offre il supporto per più piattaforme e funzionalità CI/CD migliorate per i progetti SQL Server Data Tools (SSDT).

Il minor livello di dettaglio dei file di progetto e dei riferimenti di database ai pacchetti NuGet consente ai team di collaborare in modo più efficiente su database di grandi dimensioni all'interno di un singolo progetto o di compilare più set di oggetti da diversi progetti. Le distribuzioni di database da un progetto Microsoft.Build.Sql possono essere automatizzate negli ambienti Windows e Linux che usano lo strumento dotnet Microsoft.SqlPackage per pubblicare l'artefatto della compilazione (.dacpac) dal progetto SQL. Altre informazioni sui [progetti SQL in stile SDK e DevOps per SQL](https://aka.ms/sqlprojects).

![Aggiunta di un riferimento al database in SQL Server Data Tools in stile SDK](../media/ssdt_sdk_preview_database_reference.png)

Nella versione 17.14, i [riferimenti di database](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk) sono stati ampliati per supportare i riferimenti di artefatti .dacpac e di progetto. Il supporto per i riferimenti di database come riferimenti di pacchetti sarà disponibile in una versione futura. Un aggiornamento recente al [generatore di file di soluzioni slngen](https://github.com/microsoft/slngen) ha aggiunto anche il supporto per i progetti Microsoft.Build.Sql, consentendo la gestione di soluzioni di grandi dimensioni a livello di programmazione.

Per usare i progetti SQL in stile SDK nella soluzione, assicurarsi di installare il componente dell'anteprima SSDT più recente nel programma di installazione di Visual Studio.

![Abilitare l'anteprima della funzionalità SSDT del programma di installazione](../media/ssdt_preview_installer.png)
