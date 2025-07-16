---
description: È ora possibile consentire a Copilot di adattare il codice incollato in base al contesto del codice esistente.
area: GitHub Copilot
title: Incolla adattivo
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Quando si incolla codice in Visual Studio, è spesso necessario eseguire altri passaggi per farlo funzionare. È possibile che sia necessario modificare i parametri in base a quelli già usati nella soluzione o che la sintassi e lo stile non siano in linea con il resto del documento.

La funzione Incolla adattivo consente di risparmiare tempo e lavoro regolando automaticamente il codice incollato in base al contesto del codice esistente, riducendo al minimo la necessità di modifiche manuali. Questa funzionalità supporta anche scenari come correzioni minime, aggiunte di stili al codice, formattazione, traduzioni del linguaggio di programmazione o umano e attività di compilazione o continuazione di modelli.

Ad esempio, se si dispone di una classe `Math` che implementa l'interfaccia `IMath`, copiare e incollare l'implementazione per il metodo `Ceiling` nello stesso file per adattarla e poter implementare così il membro dell'interfaccia `Floor` non ancora implementato.

![Adattare il metodo incollato per completare l'interfaccia](../media/adaptive-paste-complete-interface.mp4)

L'interfaccia utente della funzionalità Incolla adattivo viene visualizzata quando si esegue la funzione incolla normale {KeyboardShortcut:Edit.Paste}. È sufficiente premere il tasto `TAB` per richiedere un suggerimento. Verrà visualizzato un diff che confronta il codice originale incollato al codice modificato.

Provare oggi stesso abilitando l'opzione **Strumenti > Opzioni > GitHub > Copilot > Editor > Abilita Incolla adattivo**.

### È possibile provare.
Attivare la versione gratuita di GitHub Copilot e provare questa e altre funzionalità basate sull'IA.
Nessuna versione di valutazione. Nessuna carta di credito. Basta l'account GitHub. [Scaricare la versione gratuita di Copilot](https://github.com/settings/copilot).
