---
description: A configuração da conclusão de inclusão permite controlar quais cabeçalhos são exibidos na lista de conclusão da inclusão.
area: C++
title: Conclusão de inclusão configurável
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Agora você pode controlar quais cabeçalhos aparecem na lista de conclusão de inclusão ao digitar `#include`.

Agora a configuração suspensa em **Ferramentas > Opções > Editor de Texto > C/C++ > IntelliSense > Incluir estilo para sugestões** afeta sugestões de inclusão e conclusão de inclusão, com os seguintes comportamentos refinados:

- **Diretrizes Principais (Padrão)**: usa citações para caminhos relativos e colchetes angulares para todo o resto.
- **Citações**: usa citações para todos os cabeçalhos, exceto cabeçalhos padrão, que usam colchetes angulares.
- **Modo de colchetes angulares**: usa colchetes angulares para todos os cabeçalhos que fazem parte do caminho de inclusão.

![Incluir estilo para configuração de sugestões](../media/IncludeStyleSuggestionsSetting.png)

Antes, todos os cabeçalhos (exceto os relativos) apareciam nas sugestões, independentemente da sintaxe usada. Com essa atualização, você pode refinar como as sugestões de cabeçalho são exibidas ao usar `#include <> and #include ""`.
