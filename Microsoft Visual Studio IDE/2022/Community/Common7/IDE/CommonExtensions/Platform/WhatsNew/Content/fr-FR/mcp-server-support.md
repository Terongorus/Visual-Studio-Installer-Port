---
description: Connectez Visual Studio à des agents IA à l’aide du nouveau protocole MCP (Model Context Protocol), une méthode standardisée pour partager le contexte, accéder aux données et piloter des fonctionnalités intelligentes.
area: GitHub Copilot
title: Prise en charge du serveur MCP
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio prend désormais en charge les serveurs MCP, ce qui permet un développement IA plus intelligent et plus connecté. MCP est un protocole ouvert qui standardise la manière dont les applications et les agents IA partagent le contexte et agissen 

Avec MCP dans Visual Studio, vous pouvez faire plus que simplement récupérer des informations à partir de vos serveurs MCP, telles que des journaux d’activité, des échecs de test, des PR ou des problèmes. Vous pouvez également utiliser ces informations pour déclencher des **actions significatives** dans votre code, votre IDE et même vos systèmes connectés à travers votre pile.

![MCP](../media/mcp-support.png)

### Configurer votre serveur MCP

Ajoutez un fichier `mcp.json` à votre solution, et Visual Studio le détectera automatiquement. Il reconnaît également les configurations d’autres environnements tels que `.vscode/mcp.json`.

### Utilisez vos serveurs MCP

Ouvrez le menu déroulant **Outils** dans le panneau Copilot Chat pour afficher les serveurs MCP connectés. À partir de là, Copilot peut extraire le contexte et prendre des mesures à l’aide de vos systèmes existants.

**Remarque :** vous devez être en *mode Agent* pour accéder aux serveurs MCP et interagir avec eux.

---

Exploitez toute la puissance de votre pile dans Copilot sans quitter Visual Studio !

### Vous voulez essayer ?
Activez GitHub Copilot Gratuit et déverrouillez cette fonctionnalité d’IA parmi d’autres.
 Pas de version d’évaluation. Pas de carte de crédit. Juste votre compte GitHub. [Obtenez Copilot Gratuit](https://github.com/settings/copilot).
