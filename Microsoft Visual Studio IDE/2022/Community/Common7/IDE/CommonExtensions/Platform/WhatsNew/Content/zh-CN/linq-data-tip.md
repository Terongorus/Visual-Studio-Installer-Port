---
description: 增强了使用子句悬停数据提示的 LINQ 表达式调试体验。
area: Debugging & diagnostics
specUrl: 
title: 显示 LINQ 表达式的数据提示
thumbnailImage: ../media/linq-datatip-thumbnail.png
featureId: linq-datatip
devComUrl: https://developercommunity.visualstudio.com/t/Integrated-Linq-Editor/442398

---


生成和排查 LINQ 查询问题可能是一个繁琐而复杂的过程，通常要求精确的语法知识和无数次迭代。 为了减轻这些挑战，Visual Studio 2022 现在在其调试器中设置了 LINQ 悬停数据提示功能。

当在调试过程中处于中断状态时，可以将鼠标悬停在 LINQ 查询的单个子句或段上，以便在运行时计算即时查询值。

此外，还可以单击数据提示末尾的 GitHub Copilot 图标，对悬停的特定查询子句执行*使用 Copilot 分析*。 然后，Copilot 会解释该子句的语法，并说明为什么会得到指定的结果。

![LINQ Hover 数据提示示例](../media/linq-hover-example.png)

此功能显著提高效率，使调试体验更流畅、更轻松，帮助你更快地查明与 LINQ 查询相关的问题，并简化整个开发工作流。

### 想尝试一下吗？
激活 GitHub Copilot Free，并解锁此 AI 功能，以及更多功能。
 无需试用。 无需信用卡。 只需提供 GitHub 帐户。 [获取 Copilot Free](https://github.com/settings/copilot)。
