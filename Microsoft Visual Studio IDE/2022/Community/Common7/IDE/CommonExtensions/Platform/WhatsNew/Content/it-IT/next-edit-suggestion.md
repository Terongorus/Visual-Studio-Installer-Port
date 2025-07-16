---
description: NES sfrutta le modifiche già apportate e prevede quelle successive, che si tratti di un inserimento, un'eliminazione o una combinazione di entrambi.
area: GitHub Copilot
title: Abilita suggerimenti di modifica successivi
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Siamo lieti di annunciare che Suggerimenti di modifica successivi (NES) è ora disponibile in Visual Studio per migliorare ulteriormente l'esperienza di codifica. NES sfrutta le modifiche già apportate e prevede quelle successive, che si tratti di un inserimento, un'eliminazione o una combinazione di entrambi. A differenza dei completamenti, limitati alla generazione di suggerimenti nella posizione del cursore, NES supporta l'utente in qualsiasi punto del file, dove è più probabile che avvenga la prossima modifica. NES aumenta l'esperienza esistente dei completamenti di Copilot supportando le attività di modifica del codice degli sviluppatori.

### Introduzione a NES
Abilitare NES tramite **Strumenti > Opzioni > GitHub > Copilot > Completamenti di Copilot > Abilita suggerimenti di modifica successivi.**

Come per i completamenti, NES diventa disponibile non appena si inizia a scrivere codice.

Quando viene visualizzato un suggerimento di modifica, se si trova su una riga diversa da quella in cui si sta scrivendo, è consigliabile **spostarsi sulla riga corrispondente**. Non sarà più necessario cercare manualmente le modifiche correlate perché se ne occuperà NES.

 ![NES: premere TAB per passare alla barra dei suggerimenti](../media/NES-Tab-Jump.png)

Quando ci si trova sulla stessa riga della modifica, è possibile premere **TAB per accettare** il suggerimento.

  ![NES: premere TAB per accettare la barra dei suggerimenti](../media/NES-Tab-Accept.png)

Nota: è possibile attivare o disattivare le barre dei suggerimenti selezionando **Strumenti > Opzioni > IntelliCode > Avanzate > Nascondi il suggerimento visualizzato con testo grigio**. 

Oltre alle barre dei suggerimenti, viene visualizzata anche una freccia nel margine per indicare la disponibilità di un suggerimento di modifica. È possibile fare clic sulla freccia per esplorare il menu dei suggerimenti di modifica.

  ![NES: freccia nel margine](../media/NES-Gutter-Arrow.png)


### Scenari di esempio
Suggerimenti di modifica successivi può essere utile in diversi scenari, non solo per apportare modifiche ovvie ripetitive, ma anche per le modifiche logiche. Di seguito sono riportati alcuni esempi.

**Refactoring di una classe punto 2D a punto 3D:**
 
![NES: refactoring di una classe punto](../media/NES-Point.mp4)

**Aggiornamento della sintassi del codice a C++ moderno con STL:**

Si noti che NES non sta solo apportando modifiche ripetitive, come l'aggiornamento di ogni `printf()` a `std::cout`, ma aggiorna anche altra sintassi, ad esempio `fgets()`.

![NES: aggiornamento della sintassi C++](../media/NES-Migration.mp4)

**Apportare modifiche logiche in risposta a una variabile appena aggiunta:**

NES risponde rapidamente alla nuova variabile, che aggiunge un numero massimo di tentativi possibili e anche i completamenti di Copilot possono essere di aiuto.

![NES: aggiungere nuove variabili](../media/NES-AddVariable.mp4)

### È possibile provare.
Attivare la versione gratuita di GitHub Copilot e provare questa e altre funzionalità basate sull'IA.
Nessuna versione di valutazione. Nessuna carta di credito. Basta l'account GitHub. [Scaricare la versione gratuita di Copilot](https://github.com/settings/copilot).
