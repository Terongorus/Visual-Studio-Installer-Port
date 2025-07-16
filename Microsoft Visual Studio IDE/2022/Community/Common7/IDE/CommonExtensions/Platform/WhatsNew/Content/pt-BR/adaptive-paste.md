---
description: Agora você pode permitir que o Copilot ajuste seu código colado para se adequar ao contexto do código existente.
area: GitHub Copilot
title: Colagem adaptável
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Quando você está colando código no Visual Studio, geralmente há etapas adicionais necessárias para fazê-lo funcionar perfeitamente. Os parâmetros podem precisar ser ajustados para corresponder aos já usados em sua solução, ou a sintaxe e o estilo podem não estar alinhados com o restante do documento.

A colagem adaptável está aqui para economizar tempo e reduzir o esforço, ajustando automaticamente o código colado para se adequar ao contexto do código existente, minimizando a necessidade de modificações manuais. Esse recurso também dá suporte a cenários como pequenas correções de erros, estilo de código, formatação, tradução de linguagem humana e de código e tarefas de preenchimento de lacunas ou continuação do padrão.

Por exemplo, se você tiver uma `Math` classe que implementa a `IMath` interface, copiar e colar a implementação do `Ceiling` método no mesmo arquivo irá adaptá-lo para implementar o membro `Floor`da interface ainda não implementado.

![Adaptar o método colado para completar a interface](../media/adaptive-paste-complete-interface.mp4)

A interface do usuário de colagem adaptável aparecerá quando você executar uma colagem regular {KeyboardShortcut:Edit.Paste}. Basta pressionar a tecla `TAB` para solicitar uma sugestão e você verá um diff comparando o código original colado com o código ajustado.

Experimente hoje ativando a opção **Ferramentas > Opções > GitHub > Copilot > Editor > Ativar Colagem Adaptativa**.

### Quer experimentar?
Ative o GitHub Copilot Free e desbloqueie esse recurso de IA, além de muito mais.
Sem trials. Sem cartão de crédito. Apenas a sua conta do GitHub. [Obtenha o Copilot Free](https://github.com/settings/copilot).
