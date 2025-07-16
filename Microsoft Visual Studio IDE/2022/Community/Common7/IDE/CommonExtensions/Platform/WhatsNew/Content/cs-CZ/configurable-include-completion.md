---
description: Konfigurace dokončování vkládání umožňuje určit, která záhlaví se zobrazí v seznamu dokončování vkládání.
area: C++
title: Konfigurovatelné dokončování vkládání
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Nyní můžete určit, která záhlaví se zobrazí v seznamu dokončení vkládání při psaní příkazu `#include`.

Nastavení rozevíracího seznamu v nabídce **Nástroje > Možnosti > Textový editor > C/C++ > IntelliSense > Zahrnout styl pro návrhy** nyní ovlivňuje jak návrhy, tak dokončování, a to s následujícím upřesněným chováním:

- **Základní pokyny (výchozí)**: Používá uvozovky pro relativní cesty a úhlové závorky pro všechno ostatní.
- **Uvozovky**: Používá uvozovky pro všechna záhlaví kromě standardních, která používají úhlové závorky.
- **Lomené závorky**: Používá úhlové závorky pro všechna záhlaví, která jsou součástí vkládané cesty.

![Zahrnout styl pro návrhy](../media/IncludeStyleSuggestionsSetting.png)

Dříve se v návrzích zobrazovala všechna záhlaví (kromě relativních) bez ohledu na použitou syntaxi. S touto aktualizací můžete upřesnit, jak se při použití příkazů `#include <> and #include ""` návrhy záhlaví zobrazují.
