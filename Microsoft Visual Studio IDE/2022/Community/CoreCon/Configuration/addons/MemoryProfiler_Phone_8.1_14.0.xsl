<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <PACKAGE ID="EFB65F05-52CA-49FE-9799-0D120B3E8C40" NAME="Memory Profiler Collection Agent">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>
          <PACKAGE ID="C99F0DE0-95FE-4C64-9D17-EFA7574C358B" NAME="Memory Profiler v2 Collection Agent">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreArm64" ID="OneCoreArm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector\Agents</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\ClientDiagnostics\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="MemoryProfilerCollectionAgent.dll"/>
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
