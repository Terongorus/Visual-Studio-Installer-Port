---
description: 使用新的模型上下文协议 (MCP) 将 Visual Studio 连接到 AI 智能体 — 一种共享上下文、访问数据和驱动智能功能的标准化方式。
area: GitHub Copilot
title: MCP 服务器支持
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio 现在支持 MCP 服务器，实现更智能、更互联的 AI 开发。 MCP 是一个开放协议，用于规范应用程序和 AI 智能体如何共享上下文并采取行动。 

使用 Visual Studio 中的 MCP，可以做的不仅仅是从 MCP 服务器检索信息，例如日志、测试失败、PR 或问题。 还可以使用该信息来驱动代码、IDE 甚至整个堆栈中的连接系统中的**有意义的操作**。

![MCP](../media/mcp-support.png)

### 设置 MCP 服务器

将 `mcp.json` 文件添加到解决方案中，Visual Studio 将自动检测它。 它还可以识别来自其他环境（如 `.vscode/mcp.json`）的配置。

### 使用 MCP 服务器

打开 Copilot Chat 面板中的“工具”下拉菜单以查看已连接的 MCP 服务器。 从那里，Copilot 可以结合上下文，使用现有的系统采取行动。

**注意：** 需要处于*智能体模式*才能访问和与 MCP 服务器交互。

---

无需离开 Visual Studio 即可将堆栈的全部功能引入 Copilot！

### 想尝试一下吗？
激活 GitHub Copilot Free，并解锁此 AI 功能，以及更多功能。
 无需试用。 无需信用卡。 只需提供 GitHub 帐户。 [获取 Copilot Free](https://github.com/settings/copilot)。
