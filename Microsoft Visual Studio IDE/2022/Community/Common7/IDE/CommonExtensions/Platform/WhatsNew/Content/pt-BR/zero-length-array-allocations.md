---
description: A Ferramenta de Alocação do .NET agora identifica alocações de matriz de comprimento zero, ajudando a otimizar o uso e o desempenho da memória.
area: Debugging & diagnostics
title: Insights de alocação de matriz de comprimento zero
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


A Ferramenta de Alocação do .NET agora fornece informações detalhadas sobre alocações de matriz de comprimento zero, ajudando você a identificar e otimizar o uso desnecessário de memória. Embora essas alocações possam parecer insignificantes individualmente, elas podem se acumular rapidamente e afetar o desempenho, especialmente em aplicativos de alto desempenho ou com restrições de memória.

![Ferramenta de instrumentação nativa](../media/zero-length-array-allocations.mp4)

Com essa atualização, você pode investigar alocações de matriz de comprimento zero clicando no link Investigar, que abre a Exibição de alocação exibindo detalhes de alocação. Clicar duas vezes revela os caminhos de código onde essas alocações ocorrem, permitindo otimizações precisas. Para melhorar a eficiência, considere o uso de `Array.Empty<T>()`, uma instância de matriz vazia alocada estaticamente, para eliminar alocações de memória redundantes.
