---
description: Teams 工具包 17.14 GA 更新。
area: IDE
title: Microsoft 365 智能体工具包
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


我们很高兴地宣布，我们的产品（以前称为 Teams 工具包）将更名为 Microsoft 365 Agents Toolkit。 这一变化反映了我们扩大关注点并致力于支持 Microsoft 365 生态系统中更广泛的平台和项目类型。

随着我们持续优化产品，我们的工作重点正从单纯支持 Teams 开发转向赋能开发者在 Microsoft 365 平台上创建 Microsoft 365 Copilot 智能体及其他应用程序。 这些平台包括 Microsoft 365 Copilot、Microsoft Teams、Office 系列和 Outlook。 此次范围扩展使我们能够更好地为用户提供服务，通过提供全面的工具、模板和资源，支持开发各种各样的 Microsoft 365 解决方案。

新名称 Microsoft 365 Agents Toolkit 更能准确反映我们产品多样化的功能与能力。 我们相信，这一更改将有助于我们的用户更轻松地识别在 Microsoft 365 环境中可用的全部开发机会。

感谢你一直以来的支持，我们将不断发展以满足开发人员社区日益增长的需求。


### 创建声明式智能体 

我们很高兴地宣布，在本版本中，我们新增了用于构建 Microsoft 365 Copilot 声明性智能体的项目模板。

![创建 DA 项目](../media/atk_da_create.png)

可以创建带有或不带有操作的声明性智能体。 可以选择定义新的 API，或利用现有的 API来执行任务或检索数据。

使用 Microsoft 365 Agents Toolkit 在 Microsoft Copilot 中调试和预览声明性智能体。

### 启用平滑的一键式调试
在 Teams 工具包的早期版本中（现已更名为 Microsoft 365 Agents Toolkit），当用户调试任何生成的解决方案时，需要在调试项目之前使用命令 **Prepare Teams app dependency**。 此命令触发了工具包，以帮助开发人员创建调试所需的必要资源，例如注册或更新 Teams 应用。

为了增强 Visual Studio 用户的调试体验并使其更加直观，我们取消了这一步骤，并启用了一键调试体验。 现在可以直接点击调试按钮，而无需任何准备步骤。 然而，如果在两次调试事件之间对应用清单进行了修改，并且需要更新应用，仍然有一个选项可以实现这一点。
我们提供两种调试配置文件：

![调试配置文件](../media/atk_debug_profiles.png)

- **调试时更新应用**：选择默认配置文件 `[Your Target Launch Platform] (browser)`，以确保对应用所做的修改已应用。
- **调试时无需更新应用**：选择第二个配置文件 `[Your Target Launch Platform] (browser) (skip update app) `，以跳过应用资源的更新，从而使调试过程更加轻量化和快速。

### 升级到 .NET 9

此外，在此版本中，我们已更新所有项目模板以支持 .NET 9。

![.net9 支持](../media/atk_net9.png)

**祝你编码愉快！**  
*Microsoft 365 Agents Toolkit 团队*
