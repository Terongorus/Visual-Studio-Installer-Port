---
description: 现在可以让 Copilot 调整粘贴的代码，以适应现有代码的上下文。
area: GitHub Copilot
title: 自适应粘贴
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


在 Visual Studio 中粘贴代码时，通常需要一些额外的步骤才能使代码无缝运行。 可能需要调整参数以匹配解决方案中已使用的参数，或者语法和样式可能与文档的其他部分不一致。

自适应粘贴功能可自动调整粘贴的代码以适应现有代码的上下文，最大限度地减少手动修改的需要，从而节省时间和精力。 此功能还支持小错误修复、代码样式、格式化、人类语言和代码语言翻译以及填空或继续模式任务等场景。

例如，如果有一个实现了 `IMath` 接口的 `Math` 类，那么将 `Ceiling` 方法的实现复制并粘贴到同一文件中，就能使其适应尚未实现的接口成员 `Floor` 的实现。

![调整粘贴方法以完成接口](../media/adaptive-paste-complete-interface.mp4)

执行常规粘贴 {KeyboardShortcut:Edit.Paste} 时，将出现自适应粘贴 UI。 只需按 `TAB` 键请求建议，就会显示原始粘贴代码与调整后代码的比较结果。

现在通过启用**工具 > 选项 > GitHub > Copilot > 编辑器 > 启用自适应粘贴**启用自适应粘贴。

### 想尝试一下吗？
激活 GitHub Copilot Free，并解锁此 AI 功能，以及更多功能。
 无需试用。 无需信用卡。 只需提供 GitHub 帐户。 [获取 Copilot Free](https://github.com/settings/copilot)。
