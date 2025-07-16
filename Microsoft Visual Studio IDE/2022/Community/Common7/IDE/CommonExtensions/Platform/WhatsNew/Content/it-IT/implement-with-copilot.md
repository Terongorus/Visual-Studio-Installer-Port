---
description: Ora è possibile consentire a Copilot di implementare completamente un metodo C# vuoto.
area: GitHub Copilot
title: Implementare con Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Oggi, se si fa riferimento a un metodo nel codice C# che non è ancora stato implementato, è possibile usare un comune refactoring di lampadina denominato **Genera metodo** per creare immediatamente quel metodo in una classe. Tuttavia, questo refactoring crea solo un metodo con la firma corretta, ma uno scheletro e `throw new NotImplementedException` una riga vuoti in caso contrario. Ciò significa che mentre il metodo esiste tecnicamente e si deve fare meno lavoro per crearlo, si dovrà comunque implementarlo manualmente, operazione che può richiedere più tempo.

Il refactoring **Implementa con Copilot** mira a rendere ancora più produttivi in questo scenario consentendo di implementare automaticamente o *aggiungere la carne* al metodo con l'aiuto di GitHub Copilot. Quando viene rilevato un metodo vuoto contenente solo un'eccezione `NotImplementedException`, è possibile selezionare la lampadina (`CTRL+.`) sulla riga`throw` e selezionare il refactoring **Implementa con Copilot** e Copilot compilerà tutto il contenuto del metodo in base alla codebase esistente, al nome del metodo e così via.

![Implementare con Copilot](../media/implement-with-copilot.mp4)

### È possibile provare.
Attivare la versione gratuita di GitHub Copilot e sbloccare questa e altre funzionalità basate sull'intelligenza artificiale.
Nessuna versione di valutazione. Nessuna carta di credito. Basta l'account GitHub. [Scaricare la versione gratuita di Copilot](https://github.com/settings/copilot).
