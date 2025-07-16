<?xml version="1.0" standalone="no"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <ADDONCONTAINER>
      <ADDON>
        <PACKAGECONTAINER>
          <PACKAGE ID="CC6587B3-A749-4158-989F-1C3BB2B234F5" NAME="Windows10RemoteTools">
            <PACKAGETYPECONTAINER>
              <PACKAGETYPE Name="arm" ID="arm" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Windows10RemoteTools\arm</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">TailoredDeploy.exe</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="TailoredDeploy.exe"/>
                  <FILE ID="TailoredDeploy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="arm64" ID="arm64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\arm64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Windows10RemoteTools\arm64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">arm64</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">TailoredDeploy.exe</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="TailoredDeploy.exe"/>
                  <FILE ID="TailoredDeploy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="x64" ID="x64" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x64</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Windows10RemoteTools\x64</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x64</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">TailoredDeploy.exe</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="TailoredDeploy.exe"/>
                  <FILE ID="TailoredDeploy.dll"/>
                </FILECONTAINER>
              </PACKAGETYPE>
              <PACKAGETYPE Name="x86" ID="x86" Protected="true">
                <PROPERTYCONTAINER>
                  <PROPERTY ID="RemotePath" Protected="true">%VisualStudioRemoteFiles%\x86</PROPERTY>
                  <PROPERTY ID="RootPath" Protected="true" _UseVSRelativePath="true">CoreCon\Binaries\Windows10RemoteTools\x86</PROPERTY>
                  <PROPERTY ID="CommandLine" Protected="true"/>
                  <PROPERTY ID="CPU" Protected="true">x86</PROPERTY>
                  <PROPERTY ID="Host" Protected="true">TailoredDeploy.exe</PROPERTY>
                  <PROPERTY ID="CoreSystemFlavor" Protected="true">OneCore</PROPERTY>
                </PROPERTYCONTAINER>
                <FILECONTAINER>
                  <FILE ID="TailoredDeploy.exe"/>
                  <FILE ID="TailoredDeploy.dll"/>
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
