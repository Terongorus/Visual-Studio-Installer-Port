---
description: Nástroj pro přidělování .NET teď identifikuje přidělení polí s nulovou délkou, což pomáhá optimalizovat využití paměti a výkon.
area: Debugging & diagnostics
title: Přehledy přidělování polí s nulovou délkou
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


Nástroj pro přidělování .NET teď poskytuje podrobné přehledy o přidělování polí s nulovou délkou, které vám pomůžou identifikovat a optimalizovat zbytečné využití paměti. I když jsou tato jednotlivá přidělení zdánlivě nevýznamná, mohou se rychle nasčítat a ovlivnit výkon, zejména v aplikacích s vysokým výkonem nebo omezenou pamětí.

![Instrumentace nativního kódu](../media/zero-length-array-allocations.mp4)

V této aktualizaci můžete prozkoumat přidělení pole s nulovou délkou kliknutím na odkaz Prozkoumat, který otevře zobrazení přidělení s podrobnostmi o přidělení. Poklikáním se zobrazí cesty kódu, kde k těmto přidělením dochází, a můžete tak provést přesné optimalizace. Pokud chcete zvýšit efektivitu, zvažte použití `Array.Empty<T>()`, staticky přidělené prázdné instance pole, abyste eliminovali redundantní přidělení paměti.
