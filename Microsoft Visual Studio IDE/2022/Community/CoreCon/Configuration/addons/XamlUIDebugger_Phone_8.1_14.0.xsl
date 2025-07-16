<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <!--
          WARNING: Must be kept in sync with XamlUIDebugger_Win10_Isolated
          This file is used to workaround compatibility issues when deploying to the same target as VS2015. The filename
          and GUID must not change.
          -->

          <!-- Non-OneCore targets -->
          <PACKAGE ID="B968CC6A-D2C8-4197-88E3-11662042C291" NAME="XAML UI Debugger package">
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
                  <FILE ID="WinUI3\Microsoft.VisualStudio.DesignTools.WinUITap.dll"/>
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
