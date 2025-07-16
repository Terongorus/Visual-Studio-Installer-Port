---
description: Connettere Visual Studio agli agenti di intelligenza artificiale usando il nuovo protocollo MCP (Model Context Protocol), un modo standardizzato per condividere il contesto, accedere ai dati e guidare funzionalità intelligenti.
area: GitHub Copilot
title: Supporto di MCP Server
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio supporta ora i server MCP, sbloccando lo sviluppo di intelligenza artificiale più intuitiva e connessa. MCP è un protocollo aperto che standardizza il modo in cui le app e gli agenti di intelligenza artificiale condividono il contesto e intraprendono azioni. 

Con MCP in Visual Studio, è possibile eseguire più operazioni di recupero delle informazioni dai server MCP, ad esempio log, errori di test, richieste pull o problemi. È anche possibile usare queste informazioni per eseguire **azioni significative** nel codice, nell'IDE e anche nei sistemi connessi nello stack.

![MCP](../media/mcp-support.png)

### Configurare il server MCP

Aggiungere un file `mcp.json` alla soluzione e Visual Studio lo rileverà automaticamente. Riconosce anche le configurazioni da altri ambienti, ad esempio `.vscode/mcp.json`.

### Usare i server MCP

Aprire l'elenco a discesa **Strumenti** nel pannello Chat di Copilot per visualizzare i server MCP connessi. Da qui, Copilot può eseguire il pull nel contesto e intervenire usando i sistemi esistenti.

**Nota:** sarà necessario essere in *Modalità agente* per accedere e interagire con i server MCP.

---

Portare la potenza completa dello stack in Copilot senza uscire da Visual Studio.

### È possibile provare.
Attivare la versione gratuita di GitHub Copilot e sbloccare questa e altre funzionalità basate sull'intelligenza artificiale.
Nessuna versione di valutazione. Nessuna carta di credito. Basta l'account GitHub. [Scaricare la versione gratuita di Copilot](https://github.com/settings/copilot).
