# Localized	07/10/2025 10:41 PM (GMT)	303:7.1.41104 	Add-AppDevPackage.psd1
# Culture = "en-US"
ConvertFrom-StringData @'
###PSLOC
PromptYesString=&Sí
PromptNoString=&No
BundleFound=Agrupación encontrada: {0}
PackageFound=Paquete encontrado: {0}
EncryptedBundleFound=Se ha encontrado un conjunto cifrado: {0}
EncryptedPackageFound=Se ha encontrado un paquete cifrado: {0}
CertificateFound=Certificado encontrado: {0}
DependenciesFound=Paquetes de dependencia encontrados:
GettingDeveloperLicense=Adquiriendo licencia de desarrollador...
InstallingCertificate=Instalando certificado...
InstallingPackage=\nInstalando la aplicación...
AcquireLicenseSuccessful=Se ha adquirido correctamente una licencia de desarrollador.
InstallCertificateSuccessful=El certificado se ha instalado correctamente.
Success=\nCorrecto: la aplicación se instaló correctamente.
WarningInstallCert=\nEstá a punto de instalar un certificado digital en el almacén de certificados de personas de confianza de su equipo. Esta operación entraña un riesgo de seguridad importante, por lo que solo deberá realizarla si confía en el emisor de este certificado digital.\n\nCuando termine de usar la aplicación, deberá quitar manualmente el certificado digital asociado. Aquí encontrará instrucciones para realizar esta operación: http://go.microsoft.com/fwlink/?LinkId=243053\n\n¿Está seguro de que desea continuar?\n\n
ElevateActions=\nAntes de instalar esta aplicación, es necesario realizar lo siguiente:
ElevateActionDevLicense=\t- Adquiera una licencia de desarrollador
ElevateActionCertificate=\t- Instale el certificado de firma
ElevateActionsContinue=Se requieren credenciales de administrador para continuar. Acepte la solicitud de UAC e indique su contraseña de administrador si así se le solicita.
ErrorForceElevate=Debe indicar las credenciales de administrador para continuar. Ejecute este script sin el parámetro -Force o desde una ventana PowerShell elevada.
ErrorForceDeveloperLicense=La adquisición de una licencia de desarrollador requiere la interacción del usuario. Vuelva a ejecutar el script sin el parámetro -Force.
ErrorLaunchAdminFailed=Error: no se puede iniciar un nuevo proceso como administrador.
ErrorNoScriptPath=Error: debe iniciar este script desde un archivo.
ErrorNoPackageFound=Error: no se encontró ningún paquete o agrupación en el directorio del script. Asegúrese de que el paquete o agrupación que desea instalar se encuentre en el mismo directorio que este script.
ErrorManyPackagesFound=Error: se encontró más de un paquete o agrupación en el directorio del script. Asegúrese de que solo el paquete o agrupación que desea instalar se encuentre en el mismo directorio que este script.
ErrorPackageUnsigned=Error: el paquete o agrupación no tiene signatura digital o la signatura está dañada.
ErrorNoCertificateFound=Error: no se encuentran certificados en el directorio del script. Asegúrese de que el certificado usado para firmar el paquete o agrupación que está instalando se encuentre en el mismo directorio que este script.
ErrorManyCertificatesFound=Error: se encontró más de un certificado en el directorio del script. Asegúrese de que solo el certificado usado para firmar el paquete o agrupación que está instalando se encuentre en el mismo directorio que este script.
ErrorBadCertificate=Error: el archivo "{0}" no es un certificado digital válido. CertUtil devolvió el código de error {1}.
ErrorExpiredCertificate=Error: el certificado de desarrollador "{0}" ha expirado. Una causa posible es que el reloj del sistema no esté establecido en la fecha y la hora correctas. Si la configuración del sistema es correcta, póngase en contacto con el propietario de la aplicación para volver a crear un paquete o agrupación con un certificado válido.
ErrorCertificateMismatch=Error: el certificado no coincide con el que se usó para firmar el paquete o agrupación.
ErrorCertIsCA=Error: el certificado no puede ser una entidad de certificación.
ErrorBannedKeyUsage=Error: el certificado no puede tener el siguiente uso de clave: {0}. El uso de clave no debe estar especificado, o debe ser igual a "DigitalSignature".
ErrorBannedEKU=Error: el certificado no puede tener el siguiente uso mejorado de clave: {0}. Solo se permiten los EKU Firma de código y Firma de vigencia.
ErrorNoBasicConstraints=Error: no se encuentra la extensión de restricciones básicas del certificado.
ErrorNoCodeSigningEku=Error: no se encuentra el uso mejorado de clave de Firma de código.
ErrorInstallCertificateCancelled=Error: se canceló la instalación del certificado.
ErrorCertUtilInstallFailed=Error: no se puede instalar el certificado. CertUtil devolvió el código de error {0}.
ErrorGetDeveloperLicenseFailed=Error: no se puede adquirir una licencia de desarrollador. Para obtener más información, consulte http://go.microsoft.com/fwlink/?LinkID=252740.
ErrorInstallCertificateFailed=Error: no se puede instalar el certificado. Estado: {0}. Para obtener más información, consulte http://go.microsoft.com/fwlink/?LinkID=252740.
ErrorAddPackageFailed=Error: no se puede instalar la aplicación.
ErrorAddPackageFailedWithCert=Error: no se puede instalar la aplicación. para garantizar la seguridad, considere desinstalar el certificado de signatura hasta que pueda instalar la aplicación. Encontrará instrucciones al respecto aquí:\nhttp://go.microsoft.com/fwlink/?LinkId=243053
'@
