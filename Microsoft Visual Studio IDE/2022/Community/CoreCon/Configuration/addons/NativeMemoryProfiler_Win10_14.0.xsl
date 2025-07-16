<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <PACKAGE ID="BFF8EF71-B423-4E11-8F4B-9CE1061615A2" NAME="Native Memory Profiler Win10 Collection Agent">
            <PACKAGETYPECONTAINER>

              <!-- Phone device-->
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARM64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <!-- Phone emulator-->
              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <!-- OneCore ARM-->
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <!-- OneCore ARM64-->
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

                <!-- OneCore x86-->
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <!-- OneCore x64-->
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="NativeMemoryCollectionAgent.dll"/>
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
