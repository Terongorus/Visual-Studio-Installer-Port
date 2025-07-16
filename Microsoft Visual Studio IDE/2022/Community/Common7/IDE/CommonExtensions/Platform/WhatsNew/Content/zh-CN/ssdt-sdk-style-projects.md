---
description: 现在，你可以在具有增强的 SQL 调试和架构比较功能的 SQL Server Data Tools 项目中使用 SDK 样式的项目文件格式。
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: 在 SSDT 中使用 SDK 样式的 SQL 项目
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Visual Studio 17.14 中的更新为 SDK 风格的 SQL Server Data Tools（预览版）引入了新的项模板和 .dacpac 数据库引用。 SDK 样式的 SSDT SQL 项目基于 Microsoft.Build.Sql SDK，该 SDK 为 SQL Server Data Tools (SSDT) 项目提供了跨平台支持和改进的 CI/CD 功能。

通过减少冗长的项目文件和对 NuGet 包的数据库引用，团队可以在单个项目中更有效地在大型数据库上进行协作，或者从多个项目中编译多组对象。 Microsoft.Build.Sql 项目中的数据库部署可在 Windows 和 Linux 环境中使用 Microsoft.SqlPackage dotnet 工具发布 SQL 项目的生成项目 (.dacpac)。 深入了解 [SDK 样式 SQL 项目和适用于 SQL 的 DevOps](https://aka.ms/sqlprojects)。

![在 SDK 风格的 SQL Server Data Tools 中添加数据库引用](../media/ssdt_sdk_preview_database_reference.png)

在 17.14 中，[数据库引用](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk)已扩展到支持项目和 .dacpac 项目引用。 未来版本将支持将数据库引用作为包引用。 [slngen 解决方案文件生成器](https://github.com/microsoft/slngen)的最新更新还增加了对 Microsoft.Build.Sql 项目的支持，从而能够以编程方式管理大型解决方案。

要在解决方案中使用 SDK 风格的 SQL 项目，请确保在 Visual Studio 安装程序中安装最新的 SSDT 预览版组件。

![安装程序启用预览版 SSDT 功能](../media/ssdt_preview_installer.png)
