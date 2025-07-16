---
description: Conecte Visual Studio a los agentes de IA mediante el nuevo Protocolo de contexto de modelo (MCP), una manera estandarizada de compartir contexto, acceder a datos e impulsar características inteligentes.
area: GitHub Copilot
title: Compatibilidad con servidores MCP
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio es ahora compatible con servidores MCP, lo que permite un desarrollo de IA más inteligente y conectado. MCP es un protocolo abierto que estandariza la forma en que las aplicaciones y los agentes de IA comparten el contexto y actúan. 

Con MCP en Visual Studio, puede hacer algo más que recuperar información de los servidores MCP, como registros, fallos de pruebas, solicitudes de incorporación de cambios o incidencias. También puede utilizar esa información para impulsar **acciones significativas** en l código, el IDE e incluso los sistemas conectados en la pila.

![MCP](../media/mcp-support.png)

### Configuración del servidor MCP

Agregue un archivo `mcp.json` a la solución y Visual Studio lo detectará automáticamente. También reconoce las configuraciones de otros entornos, como `.vscode/mcp.json`.

### Uso de los servidores MCP

Abra la lista desplegable **Herramientas** en el panel Copilot Chat para ver los servidores MCP conectados. Desde allí, Copilot puede extraer el contexto y actuar con los sistemas existentes.

**Nota:** Tendrá que estar en *modo agente* para acceder a los servidores MCP e interactuar con ellos.

---

Lleve toda la potencia de su pila a Copilot sin salir de Visual Studio.

### ¿Quiere probarlo?
Active GitHub Copilot Free y descubra esta característica de IA, además de muchas más.
 Sin pruebas. Sin tarjeta de crédito. Solo con la cuenta de GitHub. [Obtenga Copilot Free](https://github.com/settings/copilot).
