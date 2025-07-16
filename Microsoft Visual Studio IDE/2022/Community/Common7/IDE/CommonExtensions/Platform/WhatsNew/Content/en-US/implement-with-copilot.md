---
description: You can now let Copilot fully implement your empty C# method.
area: GitHub Copilot
title: Implement with Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Today, if you're referencing a method in your C# code that hasn't been implemented yet, you can use a common lightbulb refactoring called **Generate Method** to immediately create that method in a class. However, this refactoring only creates a method with the correct signature but an empty skeleton and `throw new NotImplementedException` line otherwise. This means that while the method technically exists and you have to do less work to create it, you'll still need to implement the method yourself, which can take more time.

The **Implement with Copilot** refactoring aims to make you even more productive in this scenario by allowing you to automatically implement or *add the meat* to your method with the help of GitHub Copilot. When an empty method only containing a `NotImplementedException` throw is encountered, you can select the lightbulb (`CTRL+.`) on that `throw` line and select the **Implement with Copilot** refactoring and Copilot will fill out all the contents of your method based on your existing codebase, method name, etc.

![Implement with Copilot](../media/implement-with-copilot.mp4)

### Want to try this out?
Activate GitHub Copilot Free and unlock this AI feature, plus many more.
No trial. No credit card. Just your GitHub account. [Get Copilot Free](https://github.com/settings/copilot).
