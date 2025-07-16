<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <!--
          WARNING: This package must be kept in sync with B968CC6A-D2C8-4197-88E3-11662042C291 below
          -->
          <PACKAGE ID="9093EE4A-01E5-44ED-9214-0B4D15023FDE" NAME="XAML UI Debugger package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <!-- Xaml UI Debugging arm OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <!-- Xaml UI Debugging arm64 OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true" />
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll" />
                  <FILE ID="VsDebugEng.Xaml.dll" />
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <!-- Xaml UI Debugging x86 OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <!-- Phone does not have a x64 variant. Pick up the binaries from Windows 10 Remote tools location. -->
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!--
          WARNING: Must be kept in sync with 9093EE4A-01E5-44ED-9214-0B4D15023FDE above
          This package is used to workaround compatibility issues when deploying to the same target as VS2015. The filename
          and GUID must not change.
          -->
          <PACKAGE ID="B968CC6A-D2C8-4197-88E3-11662042C291" NAME="XAML UI Debugger package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <!-- Xaml UI Debugging arm OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <!-- Xaml UI Debugging arm64 OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true" />
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll" />
                  <FILE ID="VsDebugEng.Xaml.dll" />
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <!-- Xaml UI Debugging x86 OneCore/Phone binaries are the same. Pick up the binary from the phone location. -->
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <!-- Phone does not have a x64 variant. Pick up the binaries from Windows 10 Remote tools location. -->
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- Pick up XamlDiagnostics.dll from the windows SDK. -->
          <PACKAGE ID="57E8CC1F-36E5-41B7-972F-80E4F1016BFC" NAME="XAML UI Debugger dependency Package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\ARM\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\ARM64\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true" />
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\x86\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\x64\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!--
          WARNING: This package must be kept in sync with XamlUIDebugger_Phone_8.1_14.0.xsl
          -->
          <!-- Non-OneCore targets -->
          <PACKAGE ID="9093EE4A-01E5-44ED-9214-0B4D15023FDE" NAME="XAML UI Debugger package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\XamlDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.DesignTools.UwpTap.dll"/>
                  <FILE ID="VsDebugEng.Xaml.dll"/>
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <PACKAGE ID="57E8CC1F-36E5-41B7-972F-80E4F1016BFC" NAME="XAML UI Debugger dependency Package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\ARM\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true">%FOLDERID_Windows10SDK%Bin\x86\XamlDiagnostics</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="XamlDiagnostics.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>
        </PACKAGECONTAINER>
      </ADDON>
    </ADDONCONTAINER>
  </xsl:template>
</xsl:stylesheet>
