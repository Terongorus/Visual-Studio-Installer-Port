---
description: Aggiornamenti disponibili a livello generale della versione di giugno di Agents Toolkit 17.14.
area: IDE
title: Microsoft 365 Agents Toolkit - Giugno
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: TeamstoolkitJune

---


La versione di giugno contiene diverse correzioni per la versione disponibile a livello generale della versione 17.14:

- Abilitare l'avvio e l'anteprima dell'agente del motore personalizzato in Microsoft 365 Copilot

Nel toolkit è disponibile un modello di agente motore personalizzato denominato Weather Agent. Questo modello è stato aggiornato per abilitarlo per l'avvio e l'anteprima nella chat di Microsoft 365 Copilot. Per provare, è sufficiente selezionare il profilo di avvio di Copilot durante il debug. 

- Correzione di un errore visualizzato quando il debug non è riuscito con l'installazione di Microsoft 365 Agents Playground. A questo punto il toolkit visualizzerà un messaggio chiaro e istruzioni su come risolvere il problema.

- I modelli aggiornano la [dipendenza del manifesto dell'app alla versione 1.21](https://developer.microsoft.com/json-schemas/teams/v1.22/MicrosoftTeams.schema.json)

- Sono stati corretti diversi bug nel file README dei modelli introdotti dalle nuove modifiche di personalizzazione.

- Aggiornamento dell'icona del toolkit in Gestione estensioni.

- Risolto il problema durante l'avvio di Agents Playground, il valore dell'ID canale richiesto consente solo msteams ed emulator. Ora consente altri valori come webchat.
