﻿#
# This script just calls the Add-AppDevPackage.ps1 script that lives next to it.
#

param(
    [switch]$Force = $false,
    [switch]$SkipLoggingTelemetry = $false
)

$scriptArgs = ""
if ($Force)
{
    $scriptArgs = '-Force'
}

if ($SkipLoggingTelemetry)
{
    if ($Force)
    {
        $scriptArgs += ' '
    }

    $scriptArgs += '-SkipLoggingTelemetry'
}

try
{
    # Log telemetry data regarding the use of the script if possible.
    # There are three ways that this can be disabled:
    #   1. If the "TelemetryDependencies" folder isn't present.  This can be excluded at build time by setting the MSBuild property AppxLogTelemetryFromSideloadingScript to false
    #   2. If the SkipLoggingTelemetry switch is passed to this script.
    #   3. If Visual Studio telemetry is disabled via the registry.
    $TelemetryAssembliesFolder = (Join-Path $PSScriptRoot "TelemetryDependencies")
    if (!$SkipLoggingTelemetry -And (Test-Path $TelemetryAssembliesFolder))
    {
        $job = Start-Job -FilePath (Join-Path $TelemetryAssembliesFolder "LogSideloadingTelemetry.ps1") -ArgumentList $TelemetryAssembliesFolder, "VS/DesignTools/SideLoadingScript/Install", $null, $null
        Wait-Job -Job $job -Timeout 60 | Out-Null
    }
}
catch
{
    # Ignore telemetry errors
}

$currLocation = Get-Location
Set-Location $PSScriptRoot
Invoke-Expression ".\Add-AppDevPackage.ps1 $scriptArgs"
Set-Location $currLocation
# SIG # Begin signature block
# MIIpbQYJKoZIhvcNAQcCoIIpXjCCKVoCAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCC7kxV/l3biwCGH
# VuAKUAkPVeCZ2LSQIMJf+ROzV3B37KCCDdYwgga9MIIEpaADAgECAhMzAAAAHEif
# gd+hsLd3AAAAAAAcMA0GCSqGSIb3DQEBDAUAMIGIMQswCQYDVQQGEwJVUzETMBEG
# A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
# cm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
# aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yNDA4MDgyMTM2MjNaFw0zNTA2MjMy
# MjA0MDFaMF8xCzAJBgNVBAYTAlVTMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
# YXRpb24xMDAuBgNVBAMTJ01pY3Jvc29mdCBXaW5kb3dzIENvZGUgU2lnbmluZyBQ
# Q0EgMjAyNDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJp9a30nwXYq
# Lq7j1TT/zCtt7vxU+CCj+7BkifS/B2gXKGU7OV9SXRJGP1yFs5p6jpsYi4cYzF56
# AV0AEmmEjV8wT2lvPU5BhN3wV30HqYPIYEj5P3WXf0kXD9fvjUf1GAtXEriJ8w7A
# LNaVEm9Rs4ePA0ZsYHaCbU5kBUJQDXv76hafOcQgdFCA3I3zYtfzX2vOwx87uDOa
# CuyKORZih9c3zTf+TLC5QYLyhVMBnDXEHDOrvaw92DSyIqpdgRWpufzqDFy1egVj
# koXZhb+9pZ9heUzNXTXhOoXzexh6YzAL4flBWm+Bc1hQyESenEvBJznV+25u3h77
# jjgMUY44+WXQ4u9qddDe/U5SeAaKRvvibmi4z7QRpLvZsla0CPiOUGz00Do5sfkC
# 0EwlsSzfM3+8A9rsyFVOgWDVPzt98OJP2EoaEOq8GE9GCoN2i7/4C2FCwff1BSCT
# JWZO1Wcr2MteJE6UxGV+ihA8nN51YPKD2dYGoewrXvRzC/1HoUeSvlZf0mf9GHEt
# vvkbJVRRo6PBf0md5t87Vb1mM/fIp1eypyaxmXkgpcBwuylsOq2kSVOJ5wBPoaEs
# sJkeMcKnEuuu++UKdDHlS0DtsYjN0QnOucvTdSsdvhzKOSjJF3XVqr9f2C945LXT
# 5rxKIHUIEDBcNYU6BKDDH6rfpKOOCSilAgMBAAGjggFGMIIBQjAOBgNVHQ8BAf8E
# BAMCAYYwEAYJKwYBBAGCNxUBBAMCAQAwHQYDVR0OBBYEFB6C3w7XjLPXAjSDDtqr
# rWW5r7jsMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMA8GA1UdEwEB/wQFMAMB
# Af8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBL
# oEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMv
# TWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
# BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
# b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQEMBQADggIBAENf+N8/
# u+mUjDtc9btoA52RBc0XVDSBMQBMqxu56hXHBwuctUWs1XBqDDMIFCHu9c6Y/UF+
# TN8EIgjnujApKYmHP4f4EM3ARSmlzrpF5ozOJx0BA5FUv1jmpdf/2ZbqpvCxlxv/
# G1R4KjrSmmqPHzs6igw3b7RTbj7BxIS8fOIkwYWQhB2fLjlg+3HSrDGPFIhpIJWV
# amMIR7a72OGonjdf45rspwqIHuynZU4avy9ruB/Rhhbwm+fMb8BMecIaTmkohx/E
# ZZ5GNWcN6oTYW3G2BM3B3YznWkl9t4shP60fMue+2ksdHGWSE8EVTdSmGUdj0jrU
# c46lGVFJISF3/MxcxnlNeP1Khyr+ZzT4Ets/I7mufpaLnLalzMR2zIuhGOAWWswe
# sbjtFzkVUFgDR2SW903I0XKlbPEA6q8epHGJ9roxh85nsEKcBNUw4Scp68KCqSpF
# BaKiyV1skd+l8U50WNePMb9Bzz0OfASal8v5sQG+DW01kN+I+RKUIbM5I50wJjiH
# ymQFNDsbobFx9I95mCEEPU7fUZ3VT/HOUVbkmX7ltIC/eQAu5GO8fu+ceETMybvb
# oxUM4dYNC+PzooUxfmC0DuKRwB21bX9+acuIBkxIm4Ed3O19w1VLoA7UNOUuJ7z6
# NQ2W/+q7cnfOPl2QVL4qlgCblUT2vmQpllV3MIIHETCCBPmgAwIBAgITMwAAAIe8
# gm6Foa5TqAAAAAAAhzANBgkqhkiG9w0BAQwFADBfMQswCQYDVQQGEwJVUzEeMBwG
# A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTAwLgYDVQQDEydNaWNyb3NvZnQg
# V2luZG93cyBDb2RlIFNpZ25pbmcgUENBIDIwMjQwHhcNMjUwNTA4MTgyNDU0WhcN
# MjYwNTA2MTgyNDU0WjB0MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
# bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
# aW9uMR4wHAYDVQQDExVNaWNyb3NvZnQgQ29ycG9yYXRpb24wggIiMA0GCSqGSIb3
# DQEBAQUAA4ICDwAwggIKAoICAQC0JvvNCq9eE0sLt0WdArsItuEZpbuTI0W3EVMS
# i6PTkY1xniZhsm8rsEzr/Ngq77HknKV8GYYNkVxhppwdoQilh/R0KELXZi22Qqi4
# jEUsOYgkDHPIbnUEcQvbaG1R2ijOme/uGE9DX3RBx9Pkbi8TYec1d2iDhzF/xofy
# oZHPUTvL2PzDae7ncAjjRChG7kCzobShkcMpUZPyYMXKtqCMAx4OBYdeBF6PGfft
# 4Z16crWAmSEGMCcXQ7EVxWj1W7R5sOo4TilWQBQp9yYyvKYUObpiQwUjNZb4wALe
# Y6msmJogp7LC5N6warLYTbhwJJblmhZQIhaD8UABuP030nUofVkGDqK6xC/REnOE
# KTnsE+KaRb8JDOBXWSscNMQSR7wbX2NF+hK/S4dg6NUHzr0p0k20yY8LZg0OPOeb
# Hg5WdXUqkFHNB4Ck2aOT4rhu7YYiYBewfVZXF4/XF/BemkMKgnQToJvFJYLMPZM3
# tosN1IW0Ow3Ny3RvwQfHPGQ1kSqprOl14JFTI9CO/CZzhZbgeRB9Z3dWcXt1RYpu
# NIAkMWl7gDTRYy4gWhkgmzE1x1cz1hA8hKZIvD0VmNiwqN1HHRDHn2ryxmLgZgLh
# kth4K/i3CR+xSiptNnYnpMkE0Rre89r45MKUHytz0z0yqSsey/BsJ9RhnTvqiNrX
# Ay0TBwIDAQABo4IBrzCCAaswDgYDVR0PAQH/BAQDAgeAMB8GA1UdJQQYMBYGCisG
# AQQBgjc9BgEGCCsGAQUFBwMDMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFCYGR6ii
# PVV4VrV7+HKNkZBNf6SoMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNyb3Nv
# ZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDg2NSs1MDQ1ODEwHwYDVR0jBBgw
# FoAUHoLfDteMs9cCNIMO2qutZbmvuOwwagYDVR0fBGMwYTBfoF2gW4ZZaHR0cDov
# L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwV2luZG93
# cyUyMENvZGUlMjBTaWduaW5nJTIwUENBJTIwMjAyNC5jcmwwdwYIKwYBBQUHAQEE
# azBpMGcGCCsGAQUFBzAChltodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
# L2NlcnRzL01pY3Jvc29mdCUyMFdpbmRvd3MlMjBDb2RlJTIwU2lnbmluZyUyMFBD
# QSUyMDIwMjQuY3J0MA0GCSqGSIb3DQEBDAUAA4ICAQB+y/LNkTgCe/vYXjHxIrS/
# 73+FTugtMOG7l/fuiVFw3poLaGGtcn7LF5s8/h6soz4ST82QeZA3y/ADvl5VXeO1
# 5mROcELkFZ8kbdzqXTnyuWpDOTTm54DX2XVwxQfFIxYJqBij8pwvlNAB5r3JOBOA
# fegOad1NuCoP0/aA5hgu4ci3d0i+LaBVHm2RlHM44si1KyEg8Rs9g/SQPSijwRMt
# Da7TsWmz7F1J9P+UV36yOmwQ4jepF5h8hFUSrCJ3x7tEqA0ruiy2yCT15FcaJdnQ
# 3tZ8RRUdoCJ/pxtDI3YySMLA2XYLs4qHzoF/TPPNtaWDTvr4a+rBbUZm58pV+S14
# jhtkQAoO+275/a+ESeRSEeP9+Hde3Ez06U1MRKu+uicTPfDhUggSXzcaDImnRS6i
# FjEryJGHhRyZYoMphCjLn+PBJe58nvL/HWuP7kCMbSJOYz1ghVU/k5cgTYqq/V3E
# yzIo2K0MtwoUQcZygkTdCRUv6EtqFWbxtK6fyM6mbCoRgs2tKdMl8EN5nSMRXZEr
# sx6bG6M7BgTiSP56F//HvdLyGKfAR247Nu4/1nxgcDBZVcvCJyj6FmYKnvQEWixb
# aXFlpvCMvahUFV1b/1FKk2EF4ntMScCjyTKUXSTt8cgmVfS8FB1YkZm7IsCjBkua
# GWbGZBLKlwLys7wpFhqvOzGCGu0wghrpAgEBMHYwXzELMAkGA1UEBhMCVVMxHjAc
# BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEwMC4GA1UEAxMnTWljcm9zb2Z0
# IFdpbmRvd3MgQ29kZSBTaWduaW5nIFBDQSAyMDI0AhMzAAAAh7yCboWhrlOoAAAA
# AACHMA0GCWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEE
# MBwGCisGAQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC5
# 5sfwy7JnuBF0jRtZGRnrFzHJ1nC8iR8tv9OzWMo65TBCBgorBgEEAYI3AgEMMTQw
# MqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNyb3NvZnQu
# Y29tMA0GCSqGSIb3DQEBAQUABIICAIb/b4BapnNZbOxJDCaTGjdj4gLkNvN3cV35
# VKcLgIwbaZ4eWabcHLQmOTrqSZM6froubDMNXnq/iedAlmJZpbhyjH0qZnQzyJtd
# 1EgqyP8MxqbjpCUyojWFZZ9SLmjoTOtQEv1s9YklD+4L62fBvAwfnW+3d3B597//
# tZ0x0phKhjaKAEqRB17v1rnmfdr0yEen9DHwCPg8XqD42KXb6OfwULbaBVRhEMOf
# PPFjO/Np6mbLKBky1r7xqI5DjlFD9uUffAYsPuvOWEhV0BXS3dtkgXT6GjLMt4NW
# UPq3Q289qFKlAkRFJ1uJP24cG3egrNqR4F4I+wgn4ssy1t7k5WpapM9nu57XXQYz
# T6ccgIJ//nJuJGFZRCOiB5qsWmjdsMrvsS7ktdQTGx4BootEPRtatFINCH+gns54
# 673mVHaBfpj+aYNglyQbxEUrMPBZvMjtsMBfcD1sv9uUvfL3JyWxyyLFwnecRREv
# dNA8xj7ox84aSNzIzaN1YfpSCAJEXlohklQHFjRhWuonS55lxk7BABDh2D5Y7TQ9
# d95OuZ+VkZygkwalj5WCfFQpqnb4mlWUfmm/VbLLfgsDGTHImx+DBeF79QZTBXec
# D3Ki7lgC8TUhjclIkj3j2Ljc4GfGV9BfiSbv3HuS5lnTrcOZSRMgrRpLVL51bylt
# 51DNc5+noYIXlzCCF5MGCisGAQQBgjcDAwExgheDMIIXfwYJKoZIhvcNAQcCoIIX
# cDCCF2wCAQMxDzANBglghkgBZQMEAgEFADCCAVIGCyqGSIb3DQEJEAEEoIIBQQSC
# AT0wggE5AgEBBgorBgEEAYRZCgMBMDEwDQYJYIZIAWUDBAIBBQAEIG51lnuXxAUA
# yvGKslhxQUS6rTo+52brgj/QEOxbvQICAgZoSvm+jNQYEzIwMjUwNzEwMjI1ODUz
# LjYyOFowBIACAfSggdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
# aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
# cG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMx
# JzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo4NjAzLTA1RTAtRDk0NzElMCMGA1UE
# AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEe0wggcgMIIFCKADAgEC
# AhMzAAACBywROYnNhfvFAAEAAAIHMA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYT
# AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
# VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
# aW1lLVN0YW1wIFBDQSAyMDEwMB4XDTI1MDEzMDE5NDI1MloXDTI2MDQyMjE5NDI1
# MlowgcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
# EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNV
# BAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGll
# bGQgVFNTIEVTTjo4NjAzLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRp
# bWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIB
# AMU//3p0+Zx+A4N7f+e4W964Gy38mZLFKQ6fz1kXK0dCbfjiIug+qRXCz4KJR6NB
# psp/79zspTWerACaa2I+cbzObhKX35EllpDgPHeq0D2Z1B1LsKF/phRs/hn77yVo
# 1tNCKAmhcKbOVXfi+YLjOkWsRPgoABONdI8rSxC4WEqvuW01owUZyVdKciFydJyP
# 1BQNUtCkCwm2wofIc3tw3vhoRcukUZzUj5ZgVHFpOCpI+oZF8R+5DbIasBtaMlg5
# e555MDUxUqFbzPNISl+Mp4r+3Ze4rKSkJRoqfmzyyo1sjdse3+sT+k3PBacArP48
# 4FFsnEiSYv6f8QxWKvm7y7JY+XW3zwwrnnUAZWH7YfjOJHXhgPHPIIb3biBqicqO
# JxidZQE61euc8roBL8s3pj7wrGHbprq8psVvNqpZcCPMSJDwRj0r2lgj8oLKCLGM
# PAd9SBVJYLJPwrDuYYHJRmZE8/Fc42W4x78/wK0Ekym6HwIFbKO8V8WY5I1ErwRO
# RSaVNQBHUIg5p4GosbCxxKEV/K8NCtsKGaFeJvidExflT1iv13tVxgefp5kmyDLO
# HlAqUhsJAL9i+EUrjZx4IEMxtz463lHpP8zBx7mNXJUKapdXFY5pBzisDadXuicw
# 5kLpS8IbwsYVJkGePWWgMMtaj8j5G5GiTaP9DjNwyfCRAgMBAAGjggFJMIIBRTAd
# BgNVHQ4EFgQUcrVSYsK9etAK9H3wkGrXz/jOjR4wHwYDVR0jBBgwFoAUn6cVXQBe
# Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
# b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBD
# QSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0
# cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBU
# aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNV
# HSUBAf8EDDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQEL
# BQADggIBAOO7Sq49ueLHSyUSMPuPbbbilg48ZOZ0O87T5s1EI2RmpS/Ts/Tid/Uh
# /dj+IkSZRpTvDXYWbnzYiakP8rDYKVes0os9ME7qd/G848a1qWkCXjCqgaBnG+nF
# vbIS6cbjJlDoRA6mDV0T245ejN7eAPgeO1xzvmRxrzKK+jAQj6uFe5VRYHu+iDhM
# ZTEp2cO+mTkZIZec6E8OF0h36DqFHJd1mLCARr6r0z1dy3PhMaEOA4oWxjEWFc0l
# mj0pG4arp6+G3I125iuTOMO1ZLqBbxqRHn1SG4saxWr7gCCoRjxaVeNAYzY5OTIG
# eVAukHyoPvH2NGljYKrQ5ZaUrTB8f/XN5+tY3n5t7ztLDZM9wi50gmff1tsMbtrA
# oxVgMd+w8nxm/GBaRm5/plkCSmHR5gaHchXzjm1ouR0s4K/Dj1bGqFrkOaLY6OHw
# aNrm/2TJjcpMXJfdPgLaxzF+Cn/rFF34MY6E1U+9U9r/fJFSpjmzlRinLwOdumlX
# udA7ax7ce8JJutv7I/J6hvWRR8xhr18TZsSygxs5odGAaOLxk+38l3Zs991CgEdx
# Q6o/CMcFQhxJzvF0lliNFvibzWrGOZrcMuO44WWMxlNii9GIa8Qwv3FmPakdFTK/
# 6zm/tUbBwzquM1gzirNlAzoDZEZgkZTvzQZAbRA73zD6y5y5NWt9MIIHcTCCBVmg
# AwIBAgITMwAAABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDELMAkG
# A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
# HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
# b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMwMTgy
# MjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
# aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
# cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
# MDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOThpkzntHIhC3miy9ck
# eb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+
# uDZnhUYjDLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4
# bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhi
# JdxqD89d9P6OU8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0hyTD
# 4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXAhjBcTyziYrLNueKN
# iOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXf
# tnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n6Jl8
# P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
# ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9
# stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUe
# h17aj54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEEBQID
# AQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4E
# FgQUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9
# AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
# cy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsG
# AQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTAD
# AQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0w
# S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3Rz
# L01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
# KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWlj
# Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38
# Kq3hLB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQdTlt
# uw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99q
# b74py27YP0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQ
# JL1AoL8ZthISEV09J+BAljis9/kpicO8F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1
# ijbCHcNhcy4sa3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP
# 9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEUBHG/ZPkk
# vnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFH
# qfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+y/g7
# 5LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
# 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHIqzqKOghi
# f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCA1AwggI4AgEBMIH5oYHRpIHO
# MIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
# UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQL
# ExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5uU2hpZWxk
# IFRTUyBFU046ODYwMy0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
# LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVANO9VT9iP2VRLJ4MJqInYNrm
# FSJLoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
# EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
# bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZI
# hvcNAQELBQACBQDsGl+/MCIYDzIwMjUwNzEwMTU1MDIzWhgPMjAyNTA3MTExNTUw
# MjNaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOwaX78CAQAwCgIBAAICEDMCAf8w
# BwIBAAICEyswCgIFAOwbsT8CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGE
# WQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsFAAOCAQEA
# HCVMOmqy+m8DAVdo3Lv+ZyrTM076BFTnRsnSyhFZw5Z96oc6vY6LfFJGlPg8WY2V
# Tc1lGBaIy1ysy7XJ8eUuT/SmYUi1+XvaE1KFggCASemBcKV21FdPEcWUNz3cQm45
# GjLIZ3lXVl2FeTaUNCHvtfBcokHniHoocS187vL3jqe7+soaXB0vNkt/ZhmlhlKt
# /9b7GlwUcUt5MiGkDwscIjkRChnsgfWyqVMjDlz4ML1WHbXGLEuuHQmh8vYn8CTc
# EBBOfZyZhGWEOJb8PdgzoApn7NBHdn2t5eh+l0cPD1i2TOt44OM9CuEwhmYsL/QL
# Q0doYrUexDl29FcsllahmjGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMw
# EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
# aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
# YW1wIFBDQSAyMDEwAhMzAAACBywROYnNhfvFAAEAAAIHMA0GCWCGSAFlAwQCAQUA
# oIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
# IE3u6+5n7ywPf2tHQvaGkoFoy6IdLUz4TWltDsz9PCO5MIH6BgsqhkiG9w0BCRAC
# LzGB6jCB5zCB5DCBvQQgL/fU0dB2zUhnmw+e/n2n6/oGMEOCgM8jCICafQ8ep7Mw
# gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
# A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
# JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAgcsETmJ
# zYX7xQABAAACBzAiBCCViy37raV8+Rxuu6JBcWfUAxOoEWCQNPlZwpm69gjOyzAN
# BgkqhkiG9w0BAQsFAASCAgCfhc0Os/4RX5Neb+fREfZmRRIoCK2E/onH7aknCaSE
# PUyF5iz8DQKDGSTPGdz47RdPB/LA5GyimXa9/C++ZVP6l3+/u8vtLrewIiRyM0Yo
# XTF6hyskP4isM49Zcxfjg0NDd+OHmxL37Kazbv3Hcfnn5NaEacFZey8a0mGl7aPs
# oh1zPwyKU8K3lATJ/c7hPYfeuy602ap3P/X6pATW+h+CHHpvUpoyvcT4mxX+Wcz3
# 3xtaG2PbhJ5lT3lGAR/6CPl0pwoBTmeC0xsimQ5oelq2c22u0Ee9v0/9ITsEJf4C
# 8/D3R4f7JwNgdra/frb3qS40cm3FPaCy2qYCt+EVp9BIWtNH4kEM8+2nT0m02/M9
# mh2GMu+p/NMo7NukQr1bM+wkiF7g5O7m3e6Zag4nQ/QJaLMtUwxSy4KV1Ctn5S8L
# hUQ27s2sOJpGTgNTucY61/7aTh0rdtM3oJAm8oWjOBDItZLxxtr5VyMlEARa5ThA
# qgVEDK3mJHSG8uEBc8vqPEEORM3iZTh7t1JBn3F1yfa8jaYisKbIBlTBdrsi04GD
# AgJbKSFBPW5WciA4/a8bFGvffvhVv3W3SEtHLOYdewfB7Aq3JSGM5CVyylBN3Yz/
# pDwwsXwOu1clz2kpw9UcxU920cx3+7LRqWTwUDe+knGJyUHU5BgFsPPF6x9TDupt
# XQ==
# SIG # End signature block
