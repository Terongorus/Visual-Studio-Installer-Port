---
description: .NET 配置工具現在可以識別長度為零的陣列配置，協助將記憶體使用量和效能最佳化。
area: Debugging & diagnostics
title: 長度為零的陣列配置深入解析
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


.NET 配置工具現在針對長度為零的陣列配置提供詳細深入解析，協助您判斷不必要的記憶體使用量並加以最佳化。 雖然這些分配單獨看起來可能微不足道，但它們會快速累積並影響效能，尤其是在高效能或記憶體受限的應用程式中。

![本機檢測工具](../media/zero-length-array-allocations.mp4)

有了這項更新，您可以按一下 [調查] 連結來調查長度為零的陣列配置，這樣做會開啟 [配置檢視] 並顯示配置的詳細資料。 按兩下即可顯示這些配置發生的程式碼路徑，以進行精確的最佳化。 若要提高效率，請考慮使用 `Array.Empty<T>()`，這是以靜態方式配置的空陣列執行個體，以消除多餘的記憶體配置。
