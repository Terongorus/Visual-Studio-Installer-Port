---
description: Aktualizace verze sady nástrojů pro produkt Agents 17.14 GA z června.
area: IDE
title: Sada nástrojů pro Microsoft 365 Agents – červen
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: TeamstoolkitJune

---


Verze z června obsahuje několik oprav pro vydání verze 17.14 GA:

- Povolit spuštění a náhled agenta vlastního modulu v nástroji Microsoft 365 Copilot

V naší sadě nástrojů je k dispozici šablona Agent vlastního modulu, která se nazývá Agent počasí. Tuto šablonu jsme aktualizovali, aby se mohla spustit a zobrazit náhled v chatu Microsoft 365 Copilot. Chcete-li si to vyzkoušet, stačí při ladění vybrat profil spuštění Copilota. 

- Byla opravena chyba, která se objevila při neúspěšném ladění při instalaci testovacího prostředí Microsoft 365 Agents. Nyní se v sadě nástrojů objeví jasná zpráva a pokyny, jak problém vyřešit.

- Upgrade šablon [Závislost manifestu aplikace na verzi v1.21](https://developer.microsoft.com/json-schemas/teams/v1.22/MicrosoftTeams.schema.json)

- Opravili jsme několik chyb v souboru README šablon, které způsobily naše nové změny brandingu.

- Aktualizována ikona sady nástrojů ve Správci rozšíření.

- Opraven problém při spuštění testovacího prostředí Agents, požadovaná hodnota ID kanálu povoluje pouze msteams a emulátor. Nyní umožňuje jiné hodnoty, jako je webchat.
