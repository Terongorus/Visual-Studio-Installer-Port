---
description: Durch die Konfiguration der Include-Vervollständigung können Sie steuern, welche Überschriften in der Include-Vervollständigungsliste angezeigt werden.
area: C++
title: Konfigurierbarer Include-Abschluss
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Sie können jetzt steuern, welche Kopfzeilen in der Include-Vervollständigungsliste angezeigt werden, wenn Sie `#include` eingeben.

Die Dropdowneinstellung in **Extras > Optionen > Text-Editor > C/C++ > IntelliSense > Stil für Vorschläge einschließen** wirkt sich jetzt sowohl auf Vorschläge als auch auf den Abschluss aus, wobei die folgenden optimierten Verhaltensweisen verwendet werden:

- **Kernrichtlinien (Standard):** Verwendet Anführungszeichen für relative Pfade und spitze Klammern für alles andere.
- **Anführungszeichenmodus**: Verwendet Anführungszeichen für alle Kopfzeilen außer Standardüberschriften, die spitze Klammern verwenden.
- **Spitzklammernmodus**: Verwendet spitze Klammern für alle Kopfzeilen, die Teil des Includepfads sind.

![Einstellung „Stil für Vorschläge einschließen”](../media/IncludeStyleSuggestionsSetting.png)

Zuvor wurden alle Kopfzeilen (mit Ausnahme relativer Überschriften) unabhängig von der verwendeten Syntax in Vorschlägen angezeigt. Mit diesem Update können Sie die Darstellung von Kopfzeilenvorschlägen bei Verwendung von `#include <> and #include ""` verfeinern.
