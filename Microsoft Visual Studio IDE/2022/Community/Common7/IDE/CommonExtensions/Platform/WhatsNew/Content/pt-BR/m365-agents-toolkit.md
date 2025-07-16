---
description: Atualizações do Teams Toolkit 17.14 GA.
area: IDE
title: Kit de Ferramentas de Agentes do Microsoft 365
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


Temos o prazer de anunciar que nosso produto, anteriormente conhecido como Teams Toolkit, está sendo renomeado para Kit de Ferramentas dos Agentes do Microsoft 365. Essa alteração reflete nosso foco expandido e compromisso de dar suporte a uma gama mais ampla de plataformas e tipos de projeto no ecossistema do Microsoft 365.

À medida que continuamos a aprimorar nosso produto, estamos mudando nosso foco de apenas dar suporte ao desenvolvimento do Teams para capacitar os desenvolvedores a criar agentes do Microsoft 365 Copilot e outros aplicativos na plataforma Microsoft 365. Essas plataformas incluem Microsoft 365 Copilot, Microsoft Teams, família Office e Outlook. Essa expansão no escopo nos permite atender melhor nossos usuários, fornecendo ferramentas, modelos e recursos abrangentes para o desenvolvimento de uma ampla variedade de soluções do Microsoft 365.

O novo nome, Kit de Ferramentas dos Agentes do Microsoft 365, representa melhor as diversas funcionalidades e capacidades do nosso produto. Acreditamos que essa alteração ajudará nossos usuários a identificar mais facilmente toda a gama de oportunidades de desenvolvimento disponíveis no ambiente do Microsoft 365.

Obrigado por seu apoio contínuo à medida que evoluímos para atender às crescentes necessidades de nossa comunidade de desenvolvedores.


### Criar agente declarativo 

Temos o prazer de anunciar que, nesta versão, nós adicionamos modelos de projetos para a criação de Agentes Declarativos para o Microsoft 365 Copilot.

![criar um projeto DA](../media/atk_da_create.png)

Você pode criar um Agente Declarativo com ou sem uma ação. Você pode optar por definir novas APIs ou utilizar as existentes para executar tarefas ou recuperar dados.

Use o Kit de Ferramentas dos Agentes do Microsoft 365 para depurar e visualizar seus Agentes Declarativos no Microsoft Copilot.

### Ativar a depuração suave com um único clique
Nas versões anteriores do Kit de Ferramentas do Teams, que agora é chamado de Kit de Ferramentas dos Agentes do Microsoft 365, quando os usuários depuravam qualquer solução gerada, você precisava usar o comando **Preparar dependência do aplicativo do Teams** antes de depurar o projeto. Este comando acionou o kit de ferramentas para ajudar os desenvolvedores a criar recursos essenciais para depuração, como registrar ou atualizar o aplicativo Teams.

Para aprimorar a experiência de depuração e torná-la mais intuitiva para usuários do Visual Studio, removemos essa etapa e habilitamos a experiência de depuração com um único clique. Agora, é possível clicar diretamente no botão de depuração sem nenhuma etapa de preparação. No entanto, se você tiver feito edições no manifesto do seu aplicativo entre dois eventos de depuração e precisa atualizar seu aplicativo, ainda existe uma opção para fazer isso.
Oferecemos dois perfis de depuração:

![perfis de depuração](../media/atk_debug_profiles.png)

- **Depurar com atualização do aplicativo**: Selecione o perfil padrão `[Your Target Launch Platform] (browser)` se você fez edições no seu aplicativo para garantir que as atualizações sejam aplicadas.
- **Depurar sem atualizar o aplicativo**: Escolha o segundo perfil `[Your Target Launch Platform] (browser) (skip update app) ` para pular a atualização dos recursos do aplicativo, tornando a depuração mais fácil e rápida.

### Atualizar para .NET 9

Além disso, nesta versão, nós atualizamos todos os modelos de projetos para oferecer suporte ao .NET 9.

![Suporte do .net9](../media/atk_net9.png)

**Boa codificação!**  
*A equipe do Kit de Ferramentas dos Agentes do Microsoft 365*
