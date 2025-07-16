---
description: O NES aproveita as edições anteriores feitas e prevê a próxima edição a ser lançada, seja ela uma inserção, exclusão ou uma combinação de ambas.
area: GitHub Copilot
title: Próxima sugestão de edição
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Temos o prazer de anunciar que a opção Próxima sugestão de edição, ou NES, está disponível agora no Visual Studio para melhorar ainda mais sua experiência de codificação. O NES aproveita as edições anteriores feitas e prevê a próxima edição a ser lançada, seja ela uma inserção, exclusão ou uma combinação de ambas. Ao contrário de "Preenchimentos", que se limita a gerar sugestões no local do cursor, o NES pode oferecer suporte a você em qualquer lugar do arquivo, onde provavelmente a próxima edição ocorrerá. O NES aumenta a experiência existente de Conclusões do Copiloto apoiando as atividades de edição de código dos desenvolvedores.

### Introdução ao NES
Habilite o NES em **Ferramentas > Opções > GitHub > Conclusões do Copiloto > Habilitar Sugestões de Próxima Edição.**

Assim como o preenchimento, tudo o que você precisa fazer para obter o NES é começar a programar!

Quando for apresentada uma sugestão de edição, se ela estiver em uma linha diferente daquela em que você está agora, ela sugerirá que você primeiro **Pressione Tab para navegar até a linha correspondente**. Você não precisará mais procurar manualmente por edições relacionadas; o NES vai à frente no caminho!

 ![Guia NES para pular a barra de dicas](../media/NES-Tab-Jump.png)

Quando estiver na mesma linha que a edição, você pode **usar a tecla Tab para aceitar** a sugestão.

  ![Guia NES para aceitar a barra de dicas](../media/NES-Tab-Accept.png)

Observação: Você pode ativar/desativar as barras de dicas acessando **Ferramentas > Opções > IntelliCode > Avançado > Ocultar a dica mostrada com texto cinza**. 

Além das barras de dicas, também aparece uma seta na medianiz, para indicar que há uma sugestão de edição disponível. Você pode clicar na seta para explorar o menu de sugestões de edição.

  ![Seta na medianiz de NES](../media/NES-Gutter-Arrow.png)


### Cenários de exemplo
As próximas sugestões de edição podem ser úteis em uma série de cenários, não apenas fazendo alterações repetitivas óbvias, mas também alterações lógicas. Estes são alguns exemplos:

**Refatoração de uma classe de ponto 2D para ponto 3D:**
 
![Classe de ponto de refatoração de NES](../media/NES-Point.mp4)

**Atualização da sintaxe do código para C++ moderno usando STL:**

Observe que o NES não está apenas fazendo alterações repetitivas, como atualizar tudo `printf()` para `std::cout`, mas também atualizando outras sintaxes, como `fgets()`.

![NES atualizando a sintaxe do C++](../media/NES-Migration.mp4)

**Fazendo alterações lógicas em resposta a uma variável recém-adicionada:**

O NES responde rapidamente à nova variável, que adiciona um número máximo de suposições que um jogador pode fazer em um jogo, e o "Preenchimentos" do Copilot também entra em cena para ajudar.

![NES - Adicionar novas variáveis](../media/NES-AddVariable.mp4)

### Quer experimentar?
Ative o GitHub Copilot Free e desbloqueie esse recurso de IA, além de muito mais.
Sem trials. Sem cartão de crédito. Apenas a sua conta do GitHub. [Obtenha o Copilot Free](https://github.com/settings/copilot).
