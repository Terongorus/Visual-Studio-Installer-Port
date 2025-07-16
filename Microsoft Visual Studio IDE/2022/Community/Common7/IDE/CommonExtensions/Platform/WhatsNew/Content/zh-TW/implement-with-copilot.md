---
description: 您現在可以讓 Copilot 完全實作空的 C# 方法。
area: GitHub Copilot
title: 使用 Copilot 實作
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


現在，如果你在 C# 程式碼中參考了一個尚未實作的方法，可以使用常見的燈泡重構功能，稱為**產生方法**，立即在類別中建立該方法。 不過，這個重構功能只會建立具有正確簽章的方法，但除了空的結構之外，只有 `throw new NotImplementedException` 這行程式碼。 這表示雖然該方法在技術上已存在，減少了您建立方法的工作量，但仍需自行實作方法，這可能會花費更多時間。

**使用 Copilot 實作**重構功能，旨在讓你在這種情況下更有效率，透過 GitHub Copilot 的協助，自動為方法實作內容或是*補上核心內容*。 當遇到只包含一行 `NotImplementedException` throw 的空方法時，你可以選擇 `throw` 行旁邊的燈泡圖示（`CTRL+.`），然後選擇**使用 Copilot 實作**重構功能，Copilot 會根據您的現有程式碼庫、方法名稱等，自動補全該方法的完整內容。

![使用 Copilot 實作](../media/implement-with-copilot.mp4)

### 想要試用嗎？
啟用 GitHub Copilot 免費版，即可解鎖此 AI 功能以及更多功能。
 無試用期限。 無需信用卡。 只需擁有 GitHub 帳戶即可。 [取得 Copilot 免費版](https://github.com/settings/copilot)。
