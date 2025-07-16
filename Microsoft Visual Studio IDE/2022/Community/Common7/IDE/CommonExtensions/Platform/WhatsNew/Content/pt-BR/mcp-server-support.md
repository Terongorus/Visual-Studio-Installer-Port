---
description: Conecte o Visual Studio aos agentes de IA usando o novo MCP (Model Context Protocol) — uma maneira padronizada de compartilhar contexto, acessar dados e conduzir recursos inteligentes.
area: GitHub Copilot
title: Suporte ao servidor MCP
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


O Visual Studio agora dá suporte a servidores MCP, desbloqueando o desenvolvimento de IA mais inteligente e conectado. O MCP é um protocolo aberto que padroniza como os aplicativos e os agentes de IA compartilham o contexto e agem. 

Com o MCP no Visual Studio, você pode fazer mais do que apenas recuperar informações de seus servidores MCP, como logs, falhas de teste, PRs ou problemas. Você também pode usar essas informações para gerar **ações significativas** em seu código, seu IDE e até mesmo seus sistemas conectados em sua pilha.

![MCP](../media/mcp-support.png)

### Configurar seu servidor MCP

Adicione um `mcp.json` arquivo à sua solução e o Visual Studio o detectará automaticamente. Ele também reconhece configurações de outros ambientes, como `.vscode/mcp.json`.

### Use seus servidores MCP

Abra o menu suspenso **Ferramentas** no painel do Copilot Chat para visualizar os servidores MCP conectados. A partir daí, o Copilot pode obter contexto e agir usando seus sistemas existentes.

**Observação:** você precisará estar no *Modo de Agente* para acessar e interagir com os servidores MCP.

---

Traga todo o poder da sua pilha para o Copilot sem sair do Visual Studio!

### Quer experimentar?
Ative o GitHub Copilot Free e desbloqueie esse recurso de IA, além de muito mais.
Sem trials. Sem cartão de crédito. Apenas sua conta do GitHub. [Obtenha o Copilot Free](https://github.com/settings/copilot).
