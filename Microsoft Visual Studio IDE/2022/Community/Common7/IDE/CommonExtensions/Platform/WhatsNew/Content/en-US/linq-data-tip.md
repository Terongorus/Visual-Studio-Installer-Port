---
description: Enhanced LINQ expression debugging experience with clause hovering datatip.
area: Debugging & diagnostics
specUrl: 
title: Show datatips for LINQ Expressions
thumbnailImage: ../media/linq-datatip-thumbnail.png
featureId: linq-datatip
devComUrl: https://developercommunity.visualstudio.com/t/Integrated-Linq-Editor/442398

---


Generating and troubleshooting LINQ queries can be a tedious and intricate process, often requiring precise syntax knowledge and numerous iterations. To alleviate these challenges, Visual Studio 2022 now features a LINQ on-hover DataTip in its debugger.

While you are in a break state during debugging, you can hover over individual clauses or segments of your LINQ query to evaluate the immediate query value at runtime.

Additionally, you can click the GitHub Copilot icon at the end of the DataTip to perform an *Analyze with Copilot* on the specific query clause you hovered over. Copilot will then explain the clause's syntax and clarify why you are getting the specified result.

![LINQ Hover datatip example](../media/linq-hover-example.png)

This feature can significantly improve efficiency and make your debugging experience smoother and easier, helping you pinpoint issues with LINQ queries faster and streamline your overall development workflow.

### Want to try this out?
Activate GitHub Copilot Free and unlock this AI feature, plus many more.
No trial. No credit card. Just your GitHub account. [Get Copilot Free](https://github.com/settings/copilot).
