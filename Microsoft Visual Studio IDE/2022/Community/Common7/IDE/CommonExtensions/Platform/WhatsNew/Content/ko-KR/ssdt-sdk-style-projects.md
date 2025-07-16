---
description: 이제 향상된 SQL 디버깅 및 스키마 비교 기능을 갖춘 SQL Server Data Tools 프로젝트에서 SDK 스타일 프로젝트 파일 형식을 사용할 수 있습니다.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: SSDT에서 SDK 스타일 SQL 프로젝트 사용하기
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Visual Studio 17.14의 업데이트는 SDK 스타일 SQL Server Data Tools(미리 보기)에 새로운 항목 템플릿과 .dacpac 데이터베이스 참조를 도입합니다. SDK 스타일 SSDT SQL 프로젝트는 Microsoft.Build.Sql SDK를 기반으로 하며, 이는 SQL Server Data Tools(SSDT) 프로젝트에 대한 크로스 플랫폼 지원과 향상된 CI/CD 기능을 제공합니다.

더 간결한 프로젝트 파일과 NuGet 패키지에 대한 데이터베이스 참조 덕분에, 팀은 단일 프로젝트 내에서 대규모 데이터베이스에 대해 더 효율적으로 협업 또는 여러 프로젝트에서 여러 개의 객체 집합을 컴파일할 수 있습니다. Microsoft.Build.Sql 프로젝트에서 데이터베이스 배포는 Windows와 Linux 환경 모두에서 Microsoft.SqlPackage dotnet 도구를 사용하여 SQL 프로젝트에서 빌드 아티팩트(.dacpac)를 게시함으로써 자동화할 수 있습니다. [SDK 스타일 SQL 프로젝트 및 SQL을 위한 DevOps](https://aka.ms/sqlprojects)에 대해 더 알아보세요.

![SDK 스타일 SQL Server Data Tools에서 데이터베이스 참조 추가](../media/ssdt_sdk_preview_database_reference.png)

17.14에서는 [데이터베이스 참조](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk)가 확장되어 프로젝트 및 .dacpac 아티팩트 참조를 지원하게 되었습니다. 데이터베이스 참조를 패키지 참조로 지원하는 기능은 향후 릴리스에서 제공될 예정입니다. 최근 [slngen 솔루션 파일 생성기](https://github.com/microsoft/slngen) 업데이트에서는 Microsoft.Build.Sql 프로젝트에 대한 지원도 추가되어, 대규모 솔루션을 프로그래밍 방식으로 관리할 수 있게 되었습니다.

솔루션에서 SDK 스타일 SQL 프로젝트를 사용하려면, Visual Studio 설치 프로그램에서 최신 SSDT 미리 보기 구성 요소를 설치해야 합니다.

![설치 관리자 SSDT 기능 미리 보기 사용](../media/ssdt_preview_installer.png)
