---
description: 現在，您可以讓 Copilot 根據現有程式碼的脈絡，調整您貼上的程式碼。
area: GitHub Copilot
title: 調適型貼上
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


將程式碼貼到 Visual Studio 時，通常需要執行其他步驟才能使其順暢地運作。 可能需要調整參數以配合您解決方案中已使用的參數，或語法和樣式可能與文件的其餘部分不一致。

現已推出調適型貼上功能，它能透過自動調整貼上的程式碼以貼合您現有程式碼的脈絡，最小化手動修改的需求，從而節省時間並減少工作量。 此功能還支援以下情境，修復小錯誤、程式碼樣式、格式化、手動和程式碼語言翻譯，以及填空或繼續模式任務等場景。

例如，如果您有一個 `Math` 類別實作了 `IMath` 介面，將 `Ceiling` 方法的實作複製並貼上到同一個檔案中，則該方法會自動調整以實作尚未實作的介面成員 `Floor`。

![調整貼上的方法以完成介面](../media/adaptive-paste-complete-interface.mp4)

當您執行一般貼上 {KeyboardShortcut:Edit.Paste} 時，就會顯示調適型貼上 UI。 只需按下 `TAB` 鍵即可請求建議，然後您將看到原始貼上程式碼與調整後程式碼的差異。

立即嘗試一下，啟用選項 **[工具] > [選項] > [GitHub] > [Copilot] > [編輯器] > [啟用調適型貼上]**。

### 想要試用嗎？
啟用 GitHub Copilot 免費版，即可解鎖此 AI 功能以及更多功能。
 無試用期限。 無需信用卡。 只需擁有 GitHub 帳戶即可。 [取得 Copilot 免費版](https://github.com/settings/copilot)。
