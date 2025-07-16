---
description: 在配置包含完成后，可以控制包含完成列表中显示的标头。
area: C++
title: 可配置的包括完成
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


现在，可以控制在键入 `#include` 时，哪些标头会出现在包含完成列表中。

**工具 > 选项 > 文本编辑器 > C/C++ > IntelliSense > 包含建议样式**中的下拉设置现在同时影响包含建议和包含完成，并具有以下优化行为：

- **核心准则（默认）**：相对路径使用引号，其他内容使用尖括号。
- **引号模式**：除使用尖括号的标准标头外，所有标头均使用引号。
- **尖括号模式**：对作为包含路径一部分的所有标头使用尖括号。

![建议的包括设置样式](../media/IncludeStyleSuggestionsSetting.png)

以前，无论使用何种语法，所有标头（相对标头除外）都会出现在建议中。 通过此更新，可以优化使用 `#include <> and #include ""` 时标头建议的显示方式。
