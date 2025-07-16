---
description: Připojte sadu Visual Studio k agentům AI pomocí nového protokolu MCP (Model Context Protocol) – standardizovaného způsobu sdílení kontextu, přístupu k datům a řízení inteligentních funkcí.
area: GitHub Copilot
title: Podpora serveru MCP
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio nyní podporuje servery MCP, odemykání inteligentnějšího a více propojeného vývoje AI. MCP je otevřený protokol, který standardizuje, jak aplikace a agenti AI sdílejí kontext a provádějí akci. 

S protokolem MCP v sadě Visual Studio můžete provádět více než jen načítání informací ze serverů MCP, jako jsou protokoly, chyby testů, žádosti o přijetí změn nebo problémy. Tyto informace můžete použít také k řízení **smysluplných akcí** v kódu, integrovaném vývojovém prostředí (IDE) a dokonce i připojených systémech ve vašem zásobníku.

![MCP](../media/mcp-support.png)

### Nastavení serveru MCP

Přidejte do svého řešení soubor `mcp.json` a sada Visual Studio ho automaticky rozpozná. Rozpozná také konfigurace z jiných prostředí, jako je `.vscode/mcp.json`.

### Použití serverů MCP

Otevřete rozevírací seznam **Nástroje** na panelu Copilot Chat a zobrazí se připojené servery MCP. Odsud může Copilot získat kontext a provést akci pomocí stávajících systémů.

**Poznámka:** Abyste mohli přistupovat k serverům MCP a pracovat s nimi, musíte být v *režimu agenta*.

---

Přeneste plný výkon zásobníku do Copilota, aniž byste opustili Visual Studio!

### Chcete to vyzkoušet?
Aktivujte nástroj GitHub Copilot Free a odemkněte tuto funkci využívající umělou inteligenci a mnoho dalších.
 Žádná zkušební verze. Žádná platební karta. Jen váš účet GitHub. [Získejte nástroj Copilot Free](https://github.com/settings/copilot).
