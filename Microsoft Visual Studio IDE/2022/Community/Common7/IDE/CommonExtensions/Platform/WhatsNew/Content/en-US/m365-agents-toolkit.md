---
description: Teams Toolkit 17.14 GA updates.
area: IDE
title: Microsoft 365 Agents Toolkit
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


We are excited to announce that our product, previously known as Teams Toolkit, is being renamed to Microsoft 365 Agents Toolkit. This change reflects our expanded focus and commitment to support a broader range of platforms and project types within the Microsoft 365 ecosystem.

As we continue to enhance our product, we are shifting our focus from solely supporting Teams development to empowering developers to create Microsoft 365 Copilot agents and other applications across the Microsoft 365 platform. These platforms include Microsoft 365 Copilot, Microsoft Teams, Office family and Outlook. This expansion in scope allows us to better serve our users by providing comprehensive tools, templates and resources for developing a wide variety of Microsoft 365 solutions.

The new name, Microsoft 365 Agents Toolkit, better represents the diverse functionalities and capabilities of our product. We believe this change will help our users more easily identify the full range of development opportunities available within the Microsoft 365 environment.

Thank you for your continued support as we evolve to meet the growing needs of our developer community.


### Create declarative agent 

We're excited to announce that in this release we added project templates for building Declarative Agents for Microsoft 365 Copilot.

![create DA project](../media/atk_da_create.png)

You can create a Declarative Agent with or without an action. You can choose to define new APIs or utilize existing ones to perform tasks or retrieve data.

Use Microsoft 365 Agents Toolkit to debug and preview your Declarative Agents in Microsoft Copilot.

### Enable smooth one-click debug
In previous versions of Teams Toolkit, which is now called Microsoft 365 Agents Toolkit, when users debugged any solution generated, you needed to use the command **Prepare Teams app dependency** before debugging the project. This command triggered the toolkit to help developers create essential resources for debugging, such as registering or updating the Teams app.

To enhance the debugging experience and make it more intuitive for Visual Studio users, we have removed this step and enabled one-click debugging experience. Now, you can directly click the debug button without any preparation steps. However, if you have made edits to your app manifest between two debug events and need to update your app, there remains an option to do that.
We offer two debug profiles:

![debug profiles](../media/atk_debug_profiles.png)

- **Debug with updating app**: Select the default profile `[Your Target Launch Platform] (browser)` if you have made edits to your app to ensure the updates are applied.
- **Debug without updating app**: Choose the second profile `[Your Target Launch Platform] (browser) (skip update app) ` to skip updating the app resources, making debugging lighter and quicker.

### Upgrade to .NET 9

Additionally, in this release, we have refreshed all project templates to support .NET 9.

![.net9 support](../media/atk_net9.png)

**Happy coding!**  
*The Microsoft 365 Agents Toolkit Team*
