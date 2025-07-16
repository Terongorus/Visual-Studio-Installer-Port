---
description: SQL Server Data ToolsプロジェクトでSDKスタイルのプロジェクト ファイル形式を使用できるようになりました。SQLデバッグとスキーマ比較の機能は強化されています。
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: SSDT の SDK スタイルの SQL プロジェクトを使用する
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Visual Studio 17.14 の更新プログラムでは、SDK スタイルの SQL Server Data Tools (プレビュー) に対する新しい項目テンプレートと .dacpac データベース参照が導入されています。 SDK スタイルの SSDT SQL プロジェクトは、Microsoft.Build.Sql SDK に基づいており、SQL Server Data Tools (SSDT) プロジェクト向けにクロスプラットフォーム サポートと強化された CI/CD 機能を提供します。

NuGet パッケージへのプロジェクト ファイルとデータベース参照を減らすことで、チームは、1 つのプロジェクト内の大規模なデータベースでより効率的に共同作業を行ったり、複数のプロジェクトから複数のオブジェクト セットをコンパイルしたりできます。 Microsoft.Build.Sql プロジェクトからのデータベース デプロイは、Windows 環境および Linux 環境で自動化でき、Microsoft.SqlPackage dotnet ツールを使用して、SQL プロジェクトからビルド アーティファクト (.dacpac) を発行することができます。 [SDK スタイルの SQL プロジェクトと DevOps for SQL](https://aka.ms/sqlprojects)について確認する。

![SDK スタイルの SQL Server Data Tools にデータベース参照を追加する](../media/ssdt_sdk_preview_database_reference.png)

17.14 では、プロジェクトと .dacpac アーティファクト参照をサポートするように[データベース参照](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk)が拡張されました。 パッケージ参照としてのデータベース参照のサポートは、今後提供予定です。 [SlnGen ソリューション ファイル ジェネレーター](https://github.com/microsoft/slngen)に対する最近の更新で、Microsoft.Build.Sql プロジェクトのサポートも追加され、大規模なソリューションをプログラムで管理できるようになりました。

SDK スタイル SQL プロジェクトをソリューションで使用するためには、Visual Studio インストーラーで最新の SSDT プレビュー コンポーネントを必ずインストールします。

![インストーラーでプレビュー SSDT 機能を有効にする](../media/ssdt_preview_installer.png)
