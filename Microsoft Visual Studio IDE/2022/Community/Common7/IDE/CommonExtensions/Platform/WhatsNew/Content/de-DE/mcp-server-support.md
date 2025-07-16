---
description: Verbinden Sie Visual Studio mit KI-Agenten über das neue Model Context Protocol (MCP) – ein standardisierter Weg, um Kontext auszutauschen, auf Daten zuzugreifen und intelligente Funktionen zu steuern.
area: GitHub Copilot
title: MCP Server Support
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio unterstützt jetzt MCP-Server und ermöglicht damit eine intelligentere und besser vernetzte KI-Entwicklung. MCP ist ein offenes Protokoll, das standardisiert, wie Apps und KI-Agenten Kontext austauschen und Maßnahmen ergreifen. 

Mit MCP in Visual Studio können Sie nicht nur Informationen von Ihren MCP-Servern abrufen, wie z. B. Protokolle, Testfehler, PRs oder Probleme. Sie können diese Informationen auch nutzen, um **sinnvolle Aktionen** in Ihrem Code, Ihrer IDE und sogar in Ihren verbundenen Systemen über Ihren Stack hinweg durchzuführen.

![MCP](../media/mcp-support.png)

### Einrichten Ihres MCP-Servers

Fügen Sie eine `mcp.json`-Datei zu Ihrer Lösung hinzu, und Visual Studio erkennt sie automatisch. Es erkennt auch Configs aus anderen Umgebungen wie `.vscode/mcp.json`.

### Verwenden Ihrer MCP-Server

Öffnen Sie das Dropdown-Menü **Tools** im Chat-Panel von Copilot, um die verbundenen MCP-Server anzuzeigen. Von dort aus kann Copilot auf Ihre bestehenden Systeme zugreifen und Maßnahmen ergreifen.

**Hinweis:** Um auf MCP-Server zuzugreifen und mit ihnen zu interagieren, müssen Sie sich im *Agent-Modus* befinden.

---

Nutzen Sie den vollen Umfang Ihres Stacks in Copilot, ohne Visual Studio zu verlassen!

### Möchten Sie es selbst ausprobieren?
Aktivieren Sie GitHub Copilot Free, und nutzen Sie dieses und viele weitere KI-Features.
 Keine Testversion. Keine Kreditkarte. Nur Ihr GitHub-Konto. [Laden Sie Copilot Free herunter](https://github.com/settings/copilot).
