---
description: Konfigurowanie uzupełniania uwzględniania umożliwia kontrolowanie, które nagłówki będą widoczne na liście uzupełniania uwzględniania.
area: C++
title: Konfigurowalne wypełnianie uwzględniania
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Teraz możesz kontrolować, które nagłówki będą wyświetlane na liście uzupełniania uwzględniania, kiedy wpiszesz `#include`.

Ustawienie listy rozwijanej w **obszarze Narzędzia > Opcje > Edytor tekstu > C/C++ > IntelliSense > Uwzględnij styl sugestii** ma teraz wpływ zarówno na sugestie uwzględniania, jak i wypełnianie uwzględniania, z następującymi usprawnionymi zachowaniami:

- **Podstawowe wskazówki (domyślne)**: używa cudzysłowów dla ścieżek względnych i nawiasów ostrych dla wszystkich innych elementów.
- **Cudzysłowy**: używa cudzysłowów dla wszystkich nagłówków z wyjątkiem nagłówków standardowych, które używają nawiasów ostrych.
- **Nawiasy kątowe**: używa nawiasów ostrych dla wszystkich nagłówków, które są częścią ścieżki uwzględniania.

![Styl uwzględniania dla ustawienia sugestii](../media/IncludeStyleSuggestionsSetting.png)

Wcześniej wszystkie nagłówki (z wyjątkiem powiązanych) były wyświetlane w sugestiach niezależnie od używanej składni. Dzięki tej aktualizacji możesz dostosować sposób wyświetlania sugestii nagłówka podczas korzystania z elementu `#include <> and #include ""`.
