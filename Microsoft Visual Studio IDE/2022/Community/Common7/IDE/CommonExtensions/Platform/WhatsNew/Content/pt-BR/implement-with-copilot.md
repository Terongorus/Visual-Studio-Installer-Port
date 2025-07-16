---
description: Agora você pode permitir que o Copilot implemente totalmente seu método C# vazio.
area: GitHub Copilot
title: Implementar com o Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Hoje, se você estiver fazendo referência a um método em seu código C# que ainda não foi implementado, poderá usar uma refatoração de lâmpada comum chamada **Método Generate** para criar imediatamente esse método em uma classe. No entanto, essa refatoração só cria um método com a assinatura correta, mas um esqueleto vazio e uma linha `throw new NotImplementedException`. Isso significa que, embora o método exista tecnicamente e você tenha que fazer menos trabalho para criá-lo, ainda precisará implementar o método por conta própria, o que pode levar mais tempo.

A refatoração **Implementar com o Copilot** tem como objetivo tornar você ainda mais produtivo nesse cenário, permitindo que você implemente ou *adicione a parte substancial* automaticamente ao seu método com a ajuda do GitHub Copilot. Quando um método vazio que contém apenas um lançamento `NotImplementedException` é encontrado, você pode selecionar a lâmpada (`CTRL+.`) nessa linha `throw` e selecionar a refatoração **Implementar com o Copilot**, e o Copilot preencherá todo o conteúdo do seu método com base na base de código existente, no nome do método etc.

![Implementar com o Copilot](../media/implement-with-copilot.mp4)

### Quer experimentar?
Ative o GitHub Copilot Free e desbloqueie esse recurso de IA, além de muito mais.
Sem trials. Sem cartão de crédito. Apenas sua conta do GitHub. [Obtenha o Copilot Free](https://github.com/settings/copilot).
