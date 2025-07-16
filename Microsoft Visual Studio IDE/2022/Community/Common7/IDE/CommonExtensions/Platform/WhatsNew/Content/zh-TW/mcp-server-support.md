---
description: 使用全新的模型內容通訊協定 (Model Context Protocol，MCP) 將 Visual Studio 連接到 AI Agent。這是一種標準化的方式，可用於共用內容、存取資料及推動智慧功能。
area: GitHub Copilot
title: 支援 MCP 伺服器
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


Visual Studio 現已支援 MCP 伺服器，開啟更聰明且更具連結性的 AI 開發體驗。 MCP 是一個開放通訊協定，標準化應用程式和 AI Agent 共用內容並採取行動的方式。 

在 Visual Studio 中使用 MCP，您可以做的不僅僅是從 MCP 伺服器擷取資訊 (例如記錄、測試失敗、PR 或問題)。 您還可以利用這些資訊，在您的程式碼、IDE，甚至整個系統堆疊中的連接系統中驅動**有意義的動作**。

![MCP](../media/mcp-support.png)

### 設定 MCP 伺服器

將 `mcp.json` 檔案新增到您的解決方案中，Visual Studio 將會自動偵測它。 它也能識別來自其他環境 (例如 `.vscode/mcp.json`) 的設定檔。

### 使用 MCP 伺服器

在 Copilot Chat 面板中打開**工具**下拉式清單，即可查看已連接的 MCP 伺服器。 從那裡，Copilot 可以利用您的現有系統提取內容並採取行動。

**注意：** 您需要處於 *Agent Mode* 才能存取並與 MCP 伺服器互動。

---

在不離開 Visual Studio 的情況下，將整個系統堆疊的強大功能帶入 Copilot！

### 想要試用嗎？
啟用 GitHub Copilot 免費版，即可解鎖此 AI 功能以及更多功能。
 無試用期限。 無需信用卡。 只需擁有 GitHub 帳戶即可。 [取得 Copilot 免費版](https://github.com/settings/copilot)。
