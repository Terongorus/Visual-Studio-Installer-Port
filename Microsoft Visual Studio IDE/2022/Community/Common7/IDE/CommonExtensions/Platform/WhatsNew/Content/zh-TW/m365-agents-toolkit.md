---
description: Teams Toolkit 17.14 正式版更新。
area: IDE
title: Microsoft 365 Agents Toolkit
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


我們很高興宣布，我們的產品 (先前稱為 Teams Toolkit) 將更名為 Microsoft 365 Agents Toolkit。 此變更反映了我們擴展的重點與承諾，致力於支援 Microsoft 365 生態系統中更廣泛的平台和專案類型。

隨著我們持續提升產品，我們的重點從單純支援 Teams 開發，轉向賦能開發者打造 Microsoft 365 Copilot Agents 及其他跨 Microsoft 365 平台的應用程式。 這些平台包括 Microsoft 365 Copilot、Microsoft Teams、Office 系列及 Outlook。 此範圍擴展讓我們能更好地服務使用者，提供完整的工具、範本與資源，支援開發各種 Microsoft 365 解決方案。

新名稱 Microsoft 365 Agents Toolkit，更能代表我們產品多元的功能與能力。 我們相信此變更將幫助使用者更輕鬆辨識 Microsoft 365 環境中所有可用的開發機會。

感謝您持續的支持，讓我們得以持續進化，滿足日益成長的開發者社群需求。


### 建立宣告式代理程式 

我們很高興宣布，在此版本中，我們新增了用於建置 Microsoft 365 Copilot Declarative Agents 的專案範本。

![建立 DA 專案](../media/atk_da_create.png)

您可以使用或不使用動作來建立宣告式代理程式。 您可以選擇定義新的 API，或使用現有的 API 來執行工作或擷取資料。

使用 Microsoft 365 Agents Toolkit 來偵錯並預覽您在 Microsoft Copilot 中的 Declarative Agents。

### 啟用順暢的單鍵偵錯
在先前版本的 Teams Toolkit (現稱為 Microsoft 365 Agents Toolkit)中，當使用者偵錯任何產生的解決方案時，您需要在偵錯專案之前使用命令 **Prepare Teams app dependency** (準備 Teams 應用程式相依性)。 此命令會觸發工具組，協助開發人員建立必要的資源以進行偵錯，例如註冊或更新 Teams 應用程式。

為了增強偵錯體驗，並使 Visual Studio 對於使用者更為直覺化，我們已移除此步驟並啟用單鍵偵錯體驗。 現在，您可以直接按一下偵錯按鈕，不需任何準備步驟。 不過，如果您在兩個偵錯事件之間對應用程式資訊清單進行編輯，而且需要更新應用程式，仍然有選項可以執行。
我們提供兩個偵錯設定檔：

![偵錯設定檔](../media/atk_debug_profiles.png)

- **使用更新的應用程式進行偵錯**：如果您對應用程式進行了編輯，請選取該設定檔 `[Your Target Launch Platform] (browser)` 以確保已套用更新。
- **不更新應用程式進行偵錯**：選擇這些設定檔 `[Your Target Launch Platform] (browser) (skip update app) ` 可跳過更新應用程式資源，讓偵錯過程更加輕便和快速。

### 升級至 .NET 9

此外，在此版本中，我們已更新所有專案範本以支援 .NET 9。

![.net9 支援](../media/atk_net9.png)

**祝各位程式撰寫愉快！**  
*Microsoft 365 Agents Toolkit 團隊*
