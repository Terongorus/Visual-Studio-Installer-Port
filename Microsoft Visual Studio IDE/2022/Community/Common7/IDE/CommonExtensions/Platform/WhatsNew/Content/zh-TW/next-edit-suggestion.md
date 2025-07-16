---
description: NES 會利用先前所做的編輯，預測下一個編輯動作，無論是插入、刪除，還是混合兩者的動作。
area: GitHub Copilot
title: 下一個編輯建議
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


我們很高興地宣布，「下一個編輯建議」(簡稱 NES) 現已在 Visual Studio 中推出，以進一步改善您撰寫程式碼的體驗。 NES 會利用先前所做的編輯，預測下一個編輯動作，無論是插入、刪除，還是混合兩者的動作。 與僅限於在插入點位置生成建議的 Completions 不同，NES 可以在您檔案中的任何位置 (最有可能發生下一次編輯的位置) 提供支援。 NES 透過支援開發人員的程式碼編輯活動，增強了現有的 Copilot 完成體驗。

### NES 使用者入門
透過 **[工具] > [選項] > [GitHub] > [Copilot] > [Copilot 完成] > [啟用下一個編輯建議]** 來啟用 NES。

與完成功能類似，您只需要開始撰寫程式碼就能啟用 NES！

當您收到編輯建議時，如果建議的位置與您目前的位置處於不同的行，系統會建議您先**按 Tab 鍵前往對應的行**。 您不再需要手動搜尋相關的編輯，NES 會引導您前進！

 ![NES 按 Tab 鍵以跳躍提示欄](../media/NES-Tab-Jump.png)

在您移動到與編輯建議相同的行後，可以**按 Tab 鍵以接受**該建議。

  ![NES 按 Tab 鍵以接受提示欄](../media/NES-Tab-Accept.png)

注意：您可以透過前往 **[工具] > [選項] > [IntelliCode] > [進階] > [隱藏以灰色文字顯示的提示]** 來開啟或關閉提示欄。 

除了提示欄外，邊欄中還會顯示一個箭頭，提示您有可用的編輯建議。 您可以按一下箭頭來查看編輯建議功能表。

  ![NES 邊欄箭頭](../media/NES-Gutter-Arrow.png)


### 示範案例
下一個編輯建議可以在各種情境中提供幫助，不僅能協助進行明顯的重複性變更，還可以做出合乎邏輯的變更。 以下列出一些範例：

**將 2D Point 類別重構為 3D Point 類別：**
 
![NES 重構 Point 類別](../media/NES-Point.mp4)

**使用 STL 將程式碼語法更新為現代化 C++：**

請注意，NES 不僅能進行重複性變更 (例如將所有 `printf()` 更新為 `std::cout`)，還會更新其他語法，例如 `fgets()`。

![NES 更新 C++語法](../media/NES-Migration.mp4)

**根據新增的變數做出合乎邏輯的變更：**

NES 會迅速對新增的變數作出反應，這個變數增加了遊戲中玩家可以進行的最大猜測次數，並且 Copilot 完成功能也會介入提供協助。

![NES 新增變數](../media/NES-AddVariable.mp4)

### 想要試用嗎？
啟用 GitHub Copilot 免費版，即可解鎖此 AI 功能以及更多功能。
 無試用期限。 無需信用卡。 只需擁有 GitHub 帳戶即可。 [取得 Copilot 免費版](https://github.com/settings/copilot)。
