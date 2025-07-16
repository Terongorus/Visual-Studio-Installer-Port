<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <!-- Collector Service (new collector) -->
          <PACKAGE ID="F4461251-3FFB-4108-9743-364BB931FAF2" NAME="Diagnostics Hub Standard Collector Service">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="UCrtBase.dll" />
                  <FILE ID="api-ms-win-crt-conio-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-convert-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-environment-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-filesystem-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-heap-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-locale-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-math-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-multibyte-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-private-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-process-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-runtime-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-stdio-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-string-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-time-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-utility-l1-1-0.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="UCrtBase.dll" />
                  <FILE ID="api-ms-win-crt-conio-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-convert-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-environment-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-filesystem-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-heap-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-locale-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-math-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-multibyte-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-private-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-process-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-runtime-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-stdio-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-string-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-time-l1-1-0.dll"/>
                  <FILE ID="api-ms-win-crt-utility-l1-1-0.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="StandardCollector.Service.exe"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Runtime.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                  <FILE ID="DiagnosticsHub.Packaging.dll"/>
                  <FILE ID="KernelTraceControl.dll"/>
                  <FILE ID="VcRuntime140.dll" />
                  <FILE ID="VcRuntime140_1.dll" />
                  <FILE ID="Msvcp140.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- Collector Bridge should be placed in the same directory as Debugger.-->
          <!-- RemotePath matches definitions in RemoteDebugger_Phone_*.xsl file. -->
          <PACKAGE ID="98E13D7B-2AC3-4B11-BBEB-758AD8BD607A" NAME="Diagnostics Hub Collector Bridge">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\11.0\Debugger\bin\RemoteDebugger</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64\Collector</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.StandardCollector.Bridge.dll"/>
                  <FILE ID="DiagnosticsHub.StandardCollector.Proxy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- CPU Usage tool -->
          <PACKAGE ID="96F1F3E8-F762-4CD2-8ED9-68EC25C2C722" NAME="CPU Usage">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.CpuAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- .NET Alloc tool -->
          <PACKAGE ID="87C20E3C-A84E-4F56-8BCB-A09A23BFE077" NAME="DotNetAlloc">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- CorProfiler (needed for DotNetAlloc tool) -->
          <PACKAGE ID="EFB3AE28-9803-4C1D-939F-035B94AF2009" NAME="CorProfiler">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetObjectAllocAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.CorProfiler.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.CorProfiler.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="DiagnosticsHub.CorProfiler.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- Events Viewer tool -->
          <PACKAGE ID="4EC3701D-0B28-4AE9-8BC4-20E88CE94C81" NAME="EventsViewer">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.EventsViewerAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- Database tool -->
          <PACKAGE ID="F1498E2F-1808-4E2A-8C86-B888A59D8446" NAME="Database">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DatabaseAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- .NET Async tool -->
          <PACKAGE ID="DB99FE6F-5272-4638-BF5C-C32FC1527B26" NAME="DotNetAsync">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetAsyncAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- .NET Counters tool -->
          <PACKAGE ID="B8202F68-C106-47E4-A154-C01594600475" NAME="DotNetCounters">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.DotNetCountersAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- File IO tool -->
          <PACKAGE ID="CA2E81B1-5EB3-4DD2-BB00-566FE585CFE1" NAME="FileIO">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="ARMV4I" ID="ARMV4I" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">ARMV4I</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="ARM64" ID="ARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="X86" ID="X86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%FOLDERID_SharedData%\PhoneTools\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">X86</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreArm" ID="OneCoreArm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreARM64" ID="OneCoreARM64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX86" ID="OneCoreX86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>

              <PACKAGETYPE Name="OneCoreX64" ID="OneCoreX64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\DiagnosticsHub\Collector</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">Team Tools\DiagnosticsHub\Device\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Agents\DiagnosticsHub.FileIOAgent.dll"/>
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
