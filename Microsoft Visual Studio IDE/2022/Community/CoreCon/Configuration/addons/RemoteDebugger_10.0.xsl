<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
		
          <PACKAGE ID="EB22551A-7F66-465F-B53F-E5ABA0C0574E" NAME="msvsmon native Package">    
             <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="debuggernativearm" ID="debuggernativearm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="msvsmon.exe"/>
                  <FILE ID="msvsmon.exe.config"/>
                  <FILE ID="VSDebugEng.dll"/>
                  <FILE ID="vsdebugeng.impl.dll"/>
                  <FILE ID="CppDebug.Remote.dll"/>
                  <FILE ID="vsdebugeng.script.dll" />
                  <FILE ID="msdia140.dll"/>
                  <FILE ID="vcruntime140.dll"/>
                  <FILE ID="msvcdis140.dll"/>
                  <FILE ID="msvcp140.dll"/>
                  <FILE ID="msvcp140_atomic_wait.dll"/>
                  <FILE ID="VSDebugLaunchNotify.exe" />
                  <FILE ID="DiagnosticsHub.ClientCommon.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="%LCID%\msdbgui.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.impl.resources.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.script.resources.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="debuggernativex86" ID="debuggernativex86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">msvsmon.exe</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="msvsmon.exe"/>
                  <FILE ID="msvsmon.exe.config"/>
                  <FILE ID="VSDebugEng.dll"/>
                  <FILE ID="vsdebugeng.impl.dll"/>
                  <FILE ID="CppDebug.Remote.dll"/>
                  <FILE ID="vsdebugeng.script.dll" />
                  <FILE ID="msdia140.dll"/>
                  <FILE ID="vcruntime140.dll"/>
                  <FILE ID="msvcdis140.dll"/>
                  <FILE ID="msvcp140.dll"/>
                  <FILE ID="msvcp140_atomic_wait.dll"/>
                  <FILE ID="VSDebugLaunchNotify.exe" />
                  <FILE ID="dbgshim.dll" />
                  <FILE ID="DiagnosticsHub.ClientCommon.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="%LCID%\msdbgui.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.impl.resources.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.script.resources.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="debuggernativex64" ID="debuggernativex64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">msvsmon.exe</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="msvsmon.exe"/>
                  <FILE ID="msvsmon.exe.config"/>
                  <FILE ID="VSDebugEng.dll"/>
                  <FILE ID="vsdebugeng.impl.dll"/>
                  <FILE ID="CppDebug.Remote.dll"/>
                  <FILE ID="vsdebugeng.script.dll" />
                  <FILE ID="msdia140.dll"/>
                  <FILE ID="vcruntime140.dll"/>
                  <FILE ID="vcruntime140_1.dll"/>
                  <FILE ID="msvcdis140.dll"/>
                  <FILE ID="msvcp140.dll"/>
                  <FILE ID="msvcp140_atomic_wait.dll"/>
                  <FILE ID="VSDebugLaunchNotify.exe" />
                  <FILE ID="dbgshim.dll" />
                  <FILE ID="DiagnosticsHub.ClientCommon.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="%LCID%\msdbgui.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.impl.resources.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.script.resources.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="debuggernativearm64" ID="debuggernativearm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">msvsmon.exe</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="msvsmon.exe"/>
                  <FILE ID="msvsmon.exe.config"/>
                  <FILE ID="VSDebugEng.dll"/>
                  <FILE ID="vsdebugeng.impl.dll"/>
                  <FILE ID="CppDebug.Remote.dll"/>
                  <FILE ID="msdia140.dll"/>
                  <FILE ID="vcruntime140.dll"/>
                  <FILE ID="msvcdis140.dll"/>
                  <FILE ID="msvcp140.dll"/>
                  <FILE ID="msvcp140_atomic_wait.dll"/>
                  <FILE ID="VSDebugLaunchNotify.exe" />
                  <FILE ID="dbgshim.dll" />
                  <FILE ID="mrt100dbgshim_winarm64.dll" />
                  <FILE ID="DiagnosticsHub.ClientCommon.dll" />
                  <FILE ID="%LCID%\DiagnosticsHubMsg.dll"/>
                  <FILE ID="%LCID%\msdbgui.dll"/>
                  <FILE ID="%LCID%\vsdebugeng.impl.resources.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <PACKAGE ID="62B807E2-6539-46FB-8D67-A73DC9499940" NAME="msvsmon managed Package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="debuggermanagedx86" ID="debuggermanagedx86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\lib</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Engine.dll"/>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Metadata.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.Host.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.PortablePdb.dll"/>
                  <FILE ID="vsdebugeng.manimpl.dll"/>
                  <FILE ID="vsdebugeng.manimpl.45.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.FunctionResolver.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.CSharp.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.VisualBasic.ExpressionEvaluator.ResultProvider.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="debuggermanagedx64" ID="debuggermanagedx64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\lib</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Engine.dll"/>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Metadata.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.Host.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.PortablePdb.dll"/>
                  <FILE ID="vsdebugeng.manimpl.dll"/>
                  <FILE ID="vsdebugeng.manimpl.45.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.FunctionResolver.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.CSharp.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.VisualBasic.ExpressionEvaluator.ResultProvider.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="debuggermanagedarm64" ID="debuggermanagedarm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\lib</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Engine.dll"/>
                  <FILE ID="Microsoft.VisualStudio.Debugger.Metadata.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.dll"/>
                  <FILE ID="Microsoft.VisualStudio.VIL.Host.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.dll"/>
                  <FILE ID="Microsoft.DiaSymReader.PortablePdb.dll"/>
                  <FILE ID="vsdebugeng.manimpl.dll"/>
                  <FILE ID="vsdebugeng.manimpl.45.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.ExpressionEvaluator.FunctionResolver.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.CSharp.ExpressionEvaluator.ResultProvider.dll"/>
                  <FILE ID="Microsoft.CodeAnalysis.VisualBasic.ExpressionEvaluator.ResultProvider.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
            </PACKAGETYPECONTAINER>
            <PROPERTYCONTAINER/>
          </PACKAGE>

          <!-- The script package is used both for app debugging and IE debugging -->
          <PACKAGE ID="D8B19935-BDBF-4D5B-9619-A6693AFD4554" NAME="msvsmon script Package">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="scriptarm" ID="scriptarm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\armv4i</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="pdm.dll" />
                  <FILE ID="pdmproxy100.dll" />
                  <FILE ID="pdmproxy140.dll" />
                  <FILE ID="VSDebugScriptAgent170.dll" />
                  <FILE ID="msdbg2.dll" />
                  <FILE ID="DiagnosticsTap.dll" />
                  <FILE ID="DiagnosticsRemoteHelper.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="scriptarm64" ID="scriptarm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="scriptx86" ID="scriptx86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="pdm.dll" />
                  <FILE ID="pdmproxy100.dll" />
                  <FILE ID="pdmproxy140.dll" />
                  <FILE ID="VSDebugScriptAgent170.dll" />
                  <FILE ID="msdbg2.dll" />
                  <FILE ID="DiagnosticsTap.dll" />
                  <FILE ID="DiagnosticsRemoteHelper.dll" />
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="scriptx64" ID="scriptx64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Phone Tools\Debugger\target\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="pdm.dll" />
                  <FILE ID="pdmproxy100.dll" />
                  <FILE ID="pdmproxy140.dll" />
                  <FILE ID="VSDebugScriptAgent170.dll" />
                  <FILE ID="msdbg2.dll" />
                  <FILE ID="DiagnosticsTap.dll" />
                  <FILE ID="DiagnosticsRemoteHelper.dll" />
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
