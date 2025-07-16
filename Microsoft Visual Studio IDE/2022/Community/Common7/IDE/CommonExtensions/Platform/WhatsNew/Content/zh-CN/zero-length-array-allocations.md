---
description: .NET 分配工具现在标识零长度的数组分配，有助于优化内存使用情况和性能。
area: Debugging & diagnostics
title: 零长度数组分配见解
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


.NET 分配工具现在提供对零长度数组分配的详细见解，帮助你识别和优化不必要的内存使用情况。 虽然这些分配单个看起来无关紧要，但它们会迅速累积并影响性能，尤其是在高性能或内存受限的应用程序中。

![本机检测工具](../media/zero-length-array-allocations.mp4)

通过此更新，可以通过单击“调查”链接来调查零长度的数组分配，这将打开“分配”视图，显示分配详细信息。 双击可以显示这些分配发生的代码路径，从而实现精确的优化。 为了提高效率，请考虑使用 `Array.Empty<T>()`（静态分配的空数组实例）来消除冗余的内存分配。
