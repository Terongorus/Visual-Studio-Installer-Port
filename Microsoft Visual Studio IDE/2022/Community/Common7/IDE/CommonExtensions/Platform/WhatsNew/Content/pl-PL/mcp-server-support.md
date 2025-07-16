---
description: Łączenie programu Visual Studio z agentami sztucznej inteligencji przy użyciu nowego protokołu MCP — ustandaryzowanego sposobu udostępniania kontekstu, uzyskiwania dostępu do danych i inteligentnych funkcji.
area: GitHub Copilot
title: MCP Server Support
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Program Visual Studio obsługuje teraz serwery MCP, umożliwiając inteligentniejsze i bardziej połączone tworzenie sztucznej inteligencji. MCP to otwarty protokół, który standaryzuje sposób, w jaki aplikacje i agenci sztucznej inteligencji współdzielą kontekst i podejmują działania. 

Dzięki MCP w programie Visual Studio można wykonywać więcej czynności niż tylko pobierać informacje z serwerów MCP, takich jak dzienniki, błędy testów, PR lub problemy. Te informacje umożliwiają również wprowadzenie **znaczących akcji** w kodzie, środowisku IDE, a nawet połączonych systemach w obrębie stosu.

![MCP](../media/mcp-support.png)

### Konfigurowanie serwera MCP

Dodaj plik `mcp.json` do rozwiązania, a program Visual Studio wykryje go automatycznie. Rozpoznaje również konfiguracje z innych środowisk, takich jak `.vscode/mcp.json`.

### Korzystanie z serwerów MCP

Otwórz listę rozwijaną **Narzędzia** w panelu Czat Copilot, aby wyświetlić połączone serwery MCP. Z tego miejsca Copilot może ściągnąć kontekst i podjąć działania przy użyciu istniejących systemów.

**Uwaga:** aby uzyskiwać dostęp do serwerów MCP i korzystać z nich, musisz być w *trybie agenta*.

---

Wykorzystaj pełną moc stosu w Copilot bez opuszczania programu Visual Studio!

### Chcesz ją wypróbować?
Aktywuj darmową aplikację GitHub Copilot i odblokuj tę funkcję sztucznej inteligencji oraz wiele innych.
Brak wersji próbnej. Brak karty kredytowej. Wystarczy twoje konto usługi GitHub. [Uzyskaj bezpłatnie Copilot](https://github.com/settings/copilot).
