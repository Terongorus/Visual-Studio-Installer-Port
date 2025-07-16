---
description: Lo strumento di allocazione .NET identifica ora le allocazioni di matrici di lunghezza zero, permettendo di ottimizzare le prestazioni e l'utilizzo della memoria.
area: Debugging & diagnostics
title: Informazioni dettagliate sull'allocazione di matrici di lunghezza zero
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


Lo strumento di allocazione .NET offre ora informazioni dettagliate sulle allocazioni di matrici di lunghezza zero, permettendo di identificare e ottimizzare l'utilizzo della memoria non necessario. Sebbene queste allocazioni possano sembrare insignificanti singolarmente, possono accumularsi rapidamente e influire sulle prestazioni, soprattutto nelle applicazioni con prestazioni elevate o vincoli di memoria.

![Tool di strumentazione nativo](../media/zero-length-array-allocations.mp4)

Con questo aggiornamento, è possibile analizzare le allocazioni di matrici di lunghezza zero facendo clic sul collegamento Analizzare, che apre la visualizzazione Allocazione contenente i relativi dettagli. Facendo doppio clic vengono visualizzati i percorsi di codice in cui si verificano queste allocazioni, permettendo ottimizzazioni precise. Per migliorare l'efficienza, valutare l'uso di `Array.Empty<T>()`, un'istanza di matrice vuota allocata in modo statico per eliminare le allocazioni di memoria ridondanti.
