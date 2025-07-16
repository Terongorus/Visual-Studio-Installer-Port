---
description: Visual Studio now includes an updated UWP MSTest project template targeting .NET 9 and Native AOT.
area: Desktop
title: New UWP .NET 9 MSTest project template
thumbnailImage: ../media/uwp-net9-mstest-template-thumb.png
featureId: uwp-net9-mstest-template
devComUrl: https://github.com/microsoft/microsoft-ui-xaml/discussions/9983

---


Visual Studio now includes a new UWP MSTest project template targeting .NET 9 and Native AOT. We worked closely with the MSTest team to add all necessary support for UWP .NET 9 projects to the MSTest libraries, infrastructure, and the Visual Studio test host. This enables UWP test projects to target .NET 9 and leverage all the modern .NET SDK and MSTest tooling while still running in a UWP context as you'd expect.

![UWP .NET 9 MSTest project templates](../media/uwp-net9-mstest-template.png)

The previous UWP MSTest project template using .NET Native will still be available. However, we recommend using the new project templates targeting .NET 9 and Native AOT going forward. As in Visual Studio 17.13, we have adjusted the ordering of all UWP templates to prioritize the new .NET 9 project templates in the search results.
