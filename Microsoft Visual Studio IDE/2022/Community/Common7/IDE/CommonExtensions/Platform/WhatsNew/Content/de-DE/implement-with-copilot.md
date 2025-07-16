---
description: Jetzt können Sie Copilot Ihre leere C#-Methode vollständig implementieren lassen.
area: GitHub Copilot
title: Implementieren mit Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Wenn Sie heute auf eine Methode im C#-Code verweisen, die noch nicht implementiert wurde, können Sie eine allgemeine Glühbirnenumgestaltung namens **Methode generieren** verwenden, um diese Methode sofort in einer Klasse zu erstellen. Durch diese Umgestaltung wird jedoch nur eine Methode mit der richtigen Signatur erstellt, andernfalls aber eine leere Skelett- und `throw new NotImplementedException`-Linie. Das bedeutet, dass die Methode zwar technisch existiert und Sie weniger Arbeit für ihre Erstellung aufwenden müssen, Sie sie jedoch weiterhin selbst implementieren müssen, was mehr Zeit in Anspruch nehmen kann.

Die Umgestaltung **Implementieren mit Copilot** zielt darauf ab, Sie in diesem Szenario noch produktiver zu machen, indem Sie die Implementierung automatisch durchführen oder *den Hauptteil* ihrer Methode mithilfe von GitHub Copilot hinzufügen. Wenn eine leere Methode gefunden wird, die nur einen `NotImplementedException`-Throw enthält, können Sie die Glühbirne (`CTRL+.`) in dieser `throw`-Zeile und die Umgestaltung **Implementieren mit Copilot** auswählen, und Copilot füllt alle Inhalte Ihrer Methode basierend auf Ihrer vorhandenen Codebasis, dem Methodennamen usw. aus.

![Implementieren mit Copilot](../media/implement-with-copilot.mp4)

### Möchten Sie es selbst ausprobieren?
Aktivieren Sie GitHub Copilot Free, und nutzen Sie dieses und viele weitere KI-Features.
 Keine Testversion. Keine Kreditkarte. Nur Ihr GitHub-Konto. [Laden Sie Copilot Free herunter](https://github.com/settings/copilot).
