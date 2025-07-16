---
description: 现在可以让 Copilot 完全实现空 C# 方法。
area: GitHub Copilot
title: 使用 Copilot 实现
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


现在，如果要在尚未实现的 C# 代码中引用方法，则可以使用名为**生成方法**的常见灯泡重构，立即在某个类中创建该方法。 但是，此重构仅使用正确签名创建方法，否则仅创建空的主干和 `throw new NotImplementedException` 行。 这意味着，虽然方法在技术上存在，并且创建方法会更加轻松，但仍然需要自己实现方法，而这可能需要更长时间。

**使用 Copilot 实现**重构旨提高你在此应用场景中的工作效率，具体体现在让你能够借助 GitHub Copilot 自动实现或在方法中*添加重要功能*。 遇到仅包含 `NotImplementedException` 引发的空方法时，可以在该 `throw` 行上选择灯泡 (`CTRL+.`)，然后选择“使用 Copilot 实现”重构，而 Copilot 将根据现有代码库、方法名称等填写方法的所有内容。

![使用 Copilot 实现](../media/implement-with-copilot.mp4)

### 想尝试一下吗？
激活 GitHub Copilot Free，并解锁此 AI 功能，以及更多功能。
 无需试用。 无需信用卡。 只需提供 GitHub 帐户。 [获取 Copilot Free](https://github.com/settings/copilot)。
