# Localized	07/10/2025 10:41 PM (GMT)	303:7.1.41104 	Add-AppDevPackage.psd1
# Culture = "en-US"
ConvertFrom-StringData @'
###PSLOC
PromptYesString=はい(&Y)
PromptNoString=いいえ(&N)
BundleFound=見つかったバンドル: {0}
PackageFound=パッケージが見つかりました: {0}
EncryptedBundleFound=暗号化されたバンドルが見つかりました: {0}
EncryptedPackageFound=暗号化されたパッケージが見つかりました: {0}
CertificateFound=証明書が見つかりました: {0}
DependenciesFound=依存関係パッケージが見つかりました:
GettingDeveloperLicense=開発者ライセンスを取得しています...
InstallingCertificate=証明書をインストールしています...
InstallingPackage=\nアプリをインストールしています...
AcquireLicenseSuccessful=開発者ライセンスは正常に取得されました。
InstallCertificateSuccessful=証明書は正常にインストールされました。
Success=\n成功:  アプリは正常にインストールされました。
WarningInstallCert=\nコンピューターの信頼されたユーザー証明書ストアにデジタル証明書をインストールしようとしています。この操作には重大なセキュリティ リスクが伴うので、このデジタル証明書の発行元が信頼できる場合にのみ実行してください。\n\nこのアプリを使用して実行済みの場合は、関連するデジタル証明書を手動で削除する必要があります。手順については、以下を参照してください。http://go.microsoft.com/fwlink/?LinkId=243053\n\n続行しますか?\n\n
ElevateActions=\nこのアプリをインストールする前に、以下を行う必要があります。
ElevateActionDevLicense=\t-開発者ライセンスを取得します
ElevateActionCertificate=\t- 署名用証明書をインストールします
ElevateActionsContinue=続行するには管理者の資格情報が必要です。UAC プロンプトを受け入れ、要求された場合は管理者パスワードを入力してください。
ErrorForceElevate=続行するには管理者の資格情報を入力する必要があります。このスクリプトを、-Force パラメーターなしで実行するか管理者特権の PowerShell ウィンドウから実行してください。
ErrorForceDeveloperLicense=開発者ライセンスを取得するには、ユーザー操作が必要です。スクリプトを -Force パラメーターなしで再実行してください。
ErrorLaunchAdminFailed=エラー: 新しいプロセスを管理者として実行できませんでした。
ErrorNoScriptPath=エラー: このスクリプトはファイルから起動する必要があります。
ErrorNoPackageFound=エラー:  スクリプト ディレクトリにパッケージまたはバンドルがありません。インストールするパッケージまたはバンドルがこのスクリプトと同じディレクトリに配置されていることを確認してください。
ErrorManyPackagesFound=エラー:  スクリプト ディレクトリで複数のパッケージまたはバンドルが見つかりました。インストールするパッケージまたはバンドルだけがこのスクリプトと同じディレクトリに配置されていることを確認してください。
ErrorPackageUnsigned=エラー:パッケージまたはバンドルがデジタル署名されていない、または署名が破損しています。
ErrorNoCertificateFound=エラー:   スクリプト ディレクトリに証明書がありません。インストールするパッケージまたはバンドルに署名するために使用される証明書がこのスクリプトと同じディレクトリに配置されていることを確認してください。
ErrorManyCertificatesFound=エラー:   スクリプト ディレクトリで複数の証明書が見つかりました。インストールするパッケージまたはバンドルに署名するために使用される証明書だけがこのスクリプトと同じディレクトリに配置されていることを確認してください。
ErrorBadCertificate=エラー: ファイル "{0}" は有効なデジタル証明書ではありません。CertUtil がエラー コード {1} で戻りました。
ErrorExpiredCertificate=エラー:   開発者の証明書 "{0}" の有効期限が切れています。システム時計の日付と時刻が正しく設定されていないことが考えられます。システムの設定が正しい場合は、有効な証明書でパッケージまたはバンドルを再作成するようアプリ所有者に連絡してください。
ErrorCertificateMismatch=エラー:  この証明書はパッケージまたはバンドルに署名するために使用された証明書と一致しません。
ErrorCertIsCA=エラー: この証明書を証明機関にすることはできません。
ErrorBannedKeyUsage=エラー: この証明書では次のキー使用法は指定できません: {0}。キー使用法は指定しないか、"DigitalSignature" にする必要があります。
ErrorBannedEKU=エラー: この証明書では次の拡張キー使用法は指定できません: {0}。許可されるのは、Code Signing EKU と Lifetime Signing EKU だけです。
ErrorNoBasicConstraints=エラー: 証明書に基本制約拡張機能がありません。
ErrorNoCodeSigningEku=エラー: 証明書に Code Signing 用の拡張キー使用法がありません。
ErrorInstallCertificateCancelled=エラー:証明書のインストールは取り消されました。
ErrorCertUtilInstallFailed=エラー: 証明書をインストールできませんでした。CertUtil がエラー コード {0} で戻りました。
ErrorGetDeveloperLicenseFailed=エラー: 開発者ライセンスを取得できませんでした。詳細については  http://go.microsoft.com/fwlink/?LinkID=252740 を参照してください。
ErrorInstallCertificateFailed=エラー: 証明書をインストールできませんでした。ステータス: {0}。詳細については http://go.microsoft.com/fwlink/?LinkID=252740 を参照してください。
ErrorAddPackageFailed=エラー:  アプリをインストールできませんでした。
ErrorAddPackageFailedWithCert=エラー:  アプリをインストールできませんでした。 セキュリティを確保するために、アプリをインストールできるようになるまで、署名証明書をアンインストールすることをお勧めします。 手順については以下を参照してください:\nhttp://go.microsoft.com/fwlink/?LinkId=243053
'@
