---
description: Artık gelişmiş SQL hata ayıklama ve şema karşılaştırma özellikleriyle SQL Server Veri Araçları projelerinizde SDK stili proje dosyası biçimini kullanabilirsiniz.
area: Data
specUrl: https://techcommunity.microsoft.com/t5/azure-sql-blog/preview-release-of-sdk-style-sql-projects-in-visual-studio-2022/ba-p/4240616
title: SSDT'de SDK stili SQL projelerini kullanma
thumbnailImage: ../media/ssdt_sdk_preview_database_reference-thumb.png
featureId: ssdt-sdk
devComUrl: https://developercommunity.visualstudio.com/t/Use-new-project-file-format-for-sqlproj/480461

---


Visual Studio 17.14 güncelleştirmesinde SDK stili SQL Server Veri Araçları (önizleme) için yeni öğe şablonları ve .dacpac verin tabanı başvuruları tanıtılmaktadır. SDK stili SSDT SQL projeleri, SQL Server Veri Araçları (SSDT) projelerine platformlar arası desteği ve gelişmiş CI/CD özellikleri sağlayan Microsoft.Build.Sql SDK'yı temel alır.

Daha az ayrıntılı proje dosyaları ve NuGet paketlerine yapılan veritabanı başvuruları sayesinde, ekipler tek bir projedeki büyük veritabanları üzerinde daha verimli bir şekilde işbirliği yapabilir veya çeşitli projelerden birden çok nesne kümesi derleyebilir. Bir Microsoft.Build.Sql projesinden veritabanı dağıtımları, SQL projesinden derleme yapıtını (.dacpac) yayımlamak için Microsoft.SqlPackage dotnet aracı kullanılarak hem Windows hem de Linux ortamlarında otomatikleştirilebilir. [SDK stili SQL projeleri ve SQL için DevOps](https://aka.ms/sqlprojects) hakkında daha fazla bilgi edinin.

![SDK tarzı SQL Server Veri Araçlarına veri tabanı başvurusunun eklenmesi](../media/ssdt_sdk_preview_database_reference.png)

17.14 sürümünde, [veri tabanı başvuruları](https://learn.microsoft.com/sql/tools/sql-database-projects/concepts/database-references?pivots=sq1-visual-studio-sdk), proje ve .dacpac yapıt başvurularını destekleyecek şekilde genişletilmiştir. Paket başvuruları olarak veri tabanı başvuruları için destek gelecek bir sürümde olacaktır. [Slngen çözüm dosya oluşturucusuna](https://github.com/microsoft/slngen) yapılan son bir güncelleştirme, Microsoft.Build.Sql projeleri için de destek ekledi ve bu sayede büyük çözümlerin program aracılığıyla yönetilmesi mümkün hale geldi.

Çözümünüzde SDK stili SQL projelerini kullanmak için Visual Studio yükleyicisinde en son SSDT önizleme bileşenini yüklediğinizden emin olun.

![Yükleyici önizleme SSDT özelliğini etkinleştirme](../media/ssdt_preview_installer.png)
