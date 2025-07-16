---
description: NES 可利用之前的编辑并预测下一次编辑，无论是插入、删除还是两者的混合。
area: GitHub Copilot
title: 下一步编辑建议
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


我们非常高兴地宣布，Visual Studio 现已提供“下一步编辑建议”（简称 NES），以进一步改善编码体验。 NES 可利用之前的编辑并预测下一次编辑，无论是插入、删除还是两者的混合。 “补全”只能在插入符号位置生成建议，而 NES 则不同，它可以支持在文件的任何位置进行下一步编辑。 NES 通过支持开发人员的代码编辑活动，增强了现有的 Copilot 补全。

### NES 入门
通过**工具 > 选项 > GitHub > Copilot > Copilot 补全 > 启用下一步编辑建议**。

与完成一样，要获取 NES，只用开始编码即可！

在看到编辑建议时，如果它位于与当前所在行不同的行上，它会建议首先**按 Tab 键导航到相应的行**。 无需再手动搜索相关的编辑内容，NES 将提供指引！

 ![NES Tab 键跳转提示栏](../media/NES-Tab-Jump.png)

到达编辑所在行后，可以**按 Tab 键接受**建议。

  ![NES Tab 键接受提示栏](../media/NES-Tab-Accept.png)

注意：可以通过**工具 > 选项 > IntelliCode > 高级 > 隐藏以灰色文本显示的提示**来打开/关闭提示栏。 

除了提示栏外，滚动条槽中还会弹出一个箭头，表示有可用的编辑建议。 可以单击箭头来查看编辑建议菜单。

  ![NES 滚动条槽箭头](../media/NES-Gutter-Arrow.png)


### 示例方案
下一步编辑建议可以在各种情况下发挥作用，不仅可以做出明显的重复性修改，还可以做出合乎逻辑的修改。 以下是一些示例：

**将 2D 点类重构为 3D 点：**
 
![NES 重构点类](../media/NES-Point.mp4)

**使用 STL 将代码语法更新为新式 C++：**

请注意，NES 并不只是进行重复性更改，如将所有 `printf()` 更新为 `std::cout`，而且还更新了其他语法，如 `fgets()`。

![NES 更新 C++ 语法](../media/NES-Migration.mp4)

**根据新添加的变量进行逻辑更改：**

NES 对新变量做出了快速反应，增加了玩家在游戏中的最大猜测次数，而 Copilot 补全也会跳出来提供帮助。

![NES 添加新变量](../media/NES-AddVariable.mp4)

### 想尝试一下吗？
激活 GitHub Copilot Free，并解锁此 AI 功能，以及更多功能。
 无需试用。 无需信用卡。 只需提供 GitHub 帐户。 [获取 Copilot Free](https://github.com/settings/copilot)。
