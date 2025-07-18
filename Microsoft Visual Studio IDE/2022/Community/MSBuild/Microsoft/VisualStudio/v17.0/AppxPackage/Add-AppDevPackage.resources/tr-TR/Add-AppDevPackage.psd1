# Localized	07/10/2025 10:41 PM (GMT)	303:7.1.41104 	Add-AppDevPackage.psd1
# Culture = "en-US"
ConvertFrom-StringData @'
###PSLOC
PromptYesString=&Evet
PromptNoString=&Hayır
BundleFound=Demet bulundu: {0}
PackageFound=Paket bulundu: {0}
EncryptedBundleFound=Şifreli demet bulundu: {0}
EncryptedPackageFound=Şifreli paket bulundu: {0}
CertificateFound=Sertifika bulundu: {0}
DependenciesFound=Bağımlılık paketleri bulundu:
GettingDeveloperLicense=Geliştirici lisansı alınıyor...
InstallingCertificate=Sertifika yükleniyor...
InstallingPackage=\nUygulama yükleniyor...
AcquireLicenseSuccessful=Geliştirici lisansı başarıyla alındı.
InstallCertificateSuccessful=Sertifika başarıyla yüklendi.
Success=\nBaşarılı: Uygulamanız başarıyla yüklendi.
WarningInstallCert=\nBilgisayarınızın Güvenilen Kişiler sertifika deposuna dijital bir sertifika yüklemek üzeresiniz. Bu işlem ciddi güvenlik riskleri taşır ve yalnızca bu dijital sertifikayı oluşturan kişiye güveniyorsanız yapılmalıdır.\n\nBu uygulamayı kullanmayı bıraktığınızda ilgili dijital sertifikayı el ile kaldırmanız gerekir. Bu işleme yönelik yönergeleri şurada bulabilirsiniz: http://go.microsoft.com/fwlink/?LinkId=243053\n\nDevam etmek istediğinizden emin misiniz?\n\n
ElevateActions=\nBu uygulamayı yüklemeden önce şunları yapmanız gerekir:
ElevateActionDevLicense=\t- Geliştirici liasnsı alın
ElevateActionCertificate=\t- İmza sertifikasını yükleyin
ElevateActionsContinue=Devam etmek için yönetici kimlik bilgileri gereklidir.  Lütfen UAC istemini kabul edin ve istenirse yönetici parolanızı girin.
ErrorForceElevate=Devam etmek için yönetici kimlik bilgilerini sağlamalısınız.  Lütfen bu betiği -Force parametresi olmadan veya yükseltilmiş bir PowerShell penceresinden çalıştırın.
ErrorForceDeveloperLicense=Geliştirici lisansı almak için kullanıcı etkileşimi gereklidir.  Lütfen betiği -Force parametresi olmadan yeniden çalıştırın.
ErrorLaunchAdminFailed=Hata: Yönetici olarak yeni bir işlem başlatılamadı.
ErrorNoScriptPath=Hata: Bu betiği bir dosyadan başlatmalısınız.
ErrorNoPackageFound=Hata: Betik dizininde paket veya demet bulunamadı.  Lütfen yüklemek istediğiniz paketin veya demetin bu betik ile aynı dizine yerleştirildiğinden emin olun.
ErrorManyPackagesFound=Hata: Betik dizininde birden fazla paket veya demet bulundu.  Lütfen yalnızca yüklemek istediğiniz paketin veya demetin bu betik ile aynı dizine yerleştirildiğinden emin olun.
ErrorPackageUnsigned=Hata: Paket veya demet dijital olarak imzalanmamış veya imza bozuk.
ErrorNoCertificateFound=Hata: Betik dizininde sertifika bulunamadı.  Lütfen yüklediğiniz paketi veya demeti imzalamak için kullanılan sertifikanın bu betik ile aynı dizine yerleştirildiğinden emin olun.
ErrorManyCertificatesFound=Hata: Betik dizininde birden fazla sertifika bulundu.  Lütfen yalnızca yüklediğiniz paketi veya demeti imzalamak için kullanılan sertifikanın bu betik ile aynı dizine yerleştirildiğinden emin olun.
ErrorBadCertificate=Hata: "{0}" dosyası geçerli bir dijital sertifika değil.  CertUtil hata kodu {1} ile döndürüldü.
ErrorExpiredCertificate=Hata: "{0}" geliştirici sertifikasının süresi doldu. Sistem saatinin doğru tarih ve saate ayarlanmamış olması buna neden olabilir. Sistem ayarları doğruysa, paketi veya demeti geçerli bir sertifika ile yeniden oluşturmak üzere uygulama sahibine başvurun.
ErrorCertificateMismatch=Hata: Sertifika, paketi veya demeti imzalamak için kullanılan sertifika ile eşleşmiyor.
ErrorCertIsCA=Hata: Sertifika bir sertifika yetkilisi olamaz.
ErrorBannedKeyUsage=Hata: Sertifika şu anahtar kullanımına sahip olamaz: {0}.  Anahtar kullanımı belirtilmemiş veya "DigitalSignature" öğesine eşit olmalıdır.
ErrorBannedEKU=Hata: Sertifika şu genişletilmiş anahtar kullanımına sahip olamaz: {0}.  Yalnızca Kod İmzalama ve Ömür Boyu İmzalama EKU'larına izin verilir.
ErrorNoBasicConstraints=Hata: Sertifikada temel kısıtlamalar uzantısı eksik.
ErrorNoCodeSigningEku=Hata: Sertifikada Kod İmzalama için genişletilmiş anahtar kullanımı eksik.
ErrorInstallCertificateCancelled=Hata: Sertifika yüklemesi iptal edildi.
ErrorCertUtilInstallFailed=Hata: Sertifika yüklenemedi.  CertUtil hata kodu {0} ile döndürüldü.
ErrorGetDeveloperLicenseFailed=Hata: Geliştirici lisansı alınamadı. Daha fazla bilgi için, bkz. http://go.microsoft.com/fwlink/?LinkID=252740.
ErrorInstallCertificateFailed=Hata: Sertifika yüklenemedi. Durum: {0}. Daha fazla bilgi için, bkz. http://go.microsoft.com/fwlink/?LinkID=252740.
ErrorAddPackageFailed=Hata: Uygulama yüklenemedi.
ErrorAddPackageFailedWithCert=Hata: Uygulama yüklenemedi.  Güvenliği sağlamak için, lütfen uygulamayı yükleyene kadar imza sertifikasını kaldırmayı deneyin.  Bu işleme yönelik yönergeleri şurada bulabilirsiniz:\nhttp://go.microsoft.com/fwlink/?LinkId=243053
'@
