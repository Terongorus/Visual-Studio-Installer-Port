---
description: 設定包含自動補全功能可讓您控制將顯示在包含自動補全清單中的標頭。
area: C++
title: 可設定的包含自動補全
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


您現在可以控制當您輸入 `#include`時，包含自動補全清單中出現的標頭。

**[工具] > [選項] > [文字編輯器] > [C/C++] > [IntelliSense] > [包含建議的樣式]** 中的下拉設定現在會同時影響包含建議和包含自動補全，並具有下列調整的行為：

- **Core Guidelines (預設)**：針對相對路徑使用引號，針對其他項目使用角括弧。
- **引號模式**：除了使用角括弧的標準標頭，所有標頭都使用引號。
- **角括弧模式**：針對屬於包含路徑的所有標頭使用角括弧。

![建議設定的包含樣式](../media/IncludeStyleSuggestionsSetting.png)

之前，不論使用的語法為何，所有標頭 (除了相對標頭) 都會出現在建議中。 透過此更新，您可以調整在使用 `#include <> and #include ""` 時，標頭建議的顯示方式。
