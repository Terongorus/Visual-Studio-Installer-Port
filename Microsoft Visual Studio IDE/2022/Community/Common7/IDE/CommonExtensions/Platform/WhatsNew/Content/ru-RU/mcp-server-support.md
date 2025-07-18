---
description: Используйте для подключения Visual Studio к агентам ИИ новый протокол MCP (Model Context Protocol) — стандартизированный способ совместного использования контекста, доступа к данным и поддержки интеллектуальных функций.
area: GitHub Copilot
title: Поддержка сервера MCP
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Теперь Visual Studio поддерживает серверы MCP, за счет чего вы получаете новые интеллектуальные возможности и возможности установки связи при разработке с применением ИИ. MCP — это открытый протокол, стандартизирующий общий контекст и действия приложений и агентов ИИ. 

MCP в Visual Studio позволяет вам не ограничиваться банальным извлечением информации с серверов MCP (журналов, данных о сбоях тестирования, PR, проблемах и т. д.). Кроме того, эту информацию можно использовать для поддержки **значимых действий** в вашем коде, интегрированной среде разработки IDE и даже в подключенных системах в вашем стеке.

![MCP](../media/mcp-support.png)

### Настройка сервера MCP

Добавьте в свое решение файл `mcp.json`, и Visual Studio автоматически обнаружит его. Данное решение также распознает конфигурации из других сред, например `.vscode/mcp.json`.

### Использование серверов MCP

Чтобы ознакомиться со списком подключенных серверов MCP, откройте список **Инструменты** на панели чата Copilot. Отсюда Copilot может извлекать контекст и выполнять действия с помощью существующих систем.

**Примечание.** Для доступа к серверам MCP и взаимодействия с ними необходимо переключиться в *Режим агента*.

---

Добавьте в Copilot все возможности вашего стека, не покидая Visual Studio!

### Хотите попробовать?
Активируйте GitHub Copilot Free и получите доступ к этой ИИ-функции, а также другие возомжности.
Никаких пробных периодов. Не нужна кредитная карта. Только ваша учетная запись на GitHub. [Скачать Copilot Free](https://github.com/settings/copilot).
