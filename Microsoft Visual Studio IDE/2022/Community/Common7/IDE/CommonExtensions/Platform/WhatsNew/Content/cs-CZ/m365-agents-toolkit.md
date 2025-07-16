---
description: Aktualizace sady nástrojů pro Teams 17.14 GA.
area: IDE
title: Sada nástrojů pro Microsoft 365 Agents
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


S potěšením oznamujeme, že náš produkt, dříve známý jako Sada nástrojů Teams, se přejmenovává na Sadu nástrojů pro Microsoft 365 Agents. Tato změna odráží náš rozšířený cíl a závazek podporovat širší škálu platforem a typů projektů v ekosystému Microsoft 365.

S dalším zdokonalováním našeho produktu přesouváme naše zaměření z výhradní podpory vývoje aplikací Teams na poskytování možností vývojářům vytvářet agenty Microsoft 365 Copilot a další aplikace v rámci celé platformy Microsoft 365. Mezi tyto platformy patří Microsoft 365 Copilot, Microsoft Teams, rodina produktů Office a Outlook. Toto rozšíření rozsahu nám umožňuje lépe poskytovat služby našim uživatelům tím, že nabízíme komplexní nástroje, šablony a zdroje pro vývoj nejrůznějších řešení Microsoft 365.

Nový název Sada nástrojů pro Microsoft 365 Agents lépe vystihuje rozmanité funkce a možnosti našeho produktu. Věříme, že tato změna pomůže našim uživatelům snadněji rozpoznat celou řadu příležitostí pro vývoj dostupných v prostředí Microsoft 365.

Děkujeme vám za vaši trvalou podporu, protože se vyvíjíme tak, abychom splnili rostoucí potřeby naší komunity vývojářů.


### Vytvoření deklarativního agenta 

S radostí oznamujeme, že v této verzi jsme přidali šablony projektů pro vytváření deklarativních agentů pro nástroj Microsoft 365 Copilot.

![vytvoření projektu DA](../media/atk_da_create.png)

Deklarativního agenta můžete vytvořit s touto akcí nebo bez ní. Můžete definovat nová rozhraní API nebo využít existující rozhraní API k provádění úloh nebo načítání dat.

Pomocí sady nástrojů pro Microsoft 365 Agents můžete ladit a zobrazit náhled deklarativních agentů v nástroji Microsoft Copilot.

### Umožnění bezproblémového ladění jedním kliknutím
V předchozích verzích sady nástrojů pro Teams, která se nyní nazývá sada nástrojů pro Microsoft 365 Agents, uživatelé při ladění jakéhokoli vygenerovaného řešení museli použít příkaz **Připravit závislosti aplikace Teams** před laděním projektu. Tento příkaz aktivoval sadu nástrojů, která vývojářům pomáhá vytvářet nezbytné prostředky pro ladění, jako je registrace nebo aktualizace aplikace Teams.

Abychom vylepšili možnosti ladění a zlepšili uživatelům sady Visual Studio jeho intuitivnost, odebrali jsme tento krok a umožnili jsme ladění jedním kliknutím. Teď můžete přímo kliknout na tlačítko ladění bez jakýchkoli přípravných kroků. Pokud jste ale v manifestu aplikace provedli úpravy mezi dvěma laděními a potřebujete aplikaci aktualizovat, tuto možnost stále máte.
Nabízíme dva profily ladění:

![profily ladění](../media/atk_debug_profiles.png)

- **Ladění s aktualizací aplikace**: Vyberte výchozí profil `[Your Target Launch Platform] (browser)`, pokud jste v aplikaci provedli úpravy. Tím zajistíte, že se aktualizace použijí.
- **Ladění bez aktualizace aplikace**: Vyberte druhý profil `[Your Target Launch Platform] (browser) (skip update app) `, čímž přeskočíte aktualizaci prostředků Teams. Tento výběr usnadňuje a zrychluje ladění.

### Upgrade na .NET 9

V této verzi jsme dále aktualizovali všechny šablony projektů, aby podporovaly .NET 9.

![podpora .net9](../media/atk_net9.png)

**Ať se vám dobře kóduje!**  
*Tým sady nástrojů pro Microsoft 365 Agents*
