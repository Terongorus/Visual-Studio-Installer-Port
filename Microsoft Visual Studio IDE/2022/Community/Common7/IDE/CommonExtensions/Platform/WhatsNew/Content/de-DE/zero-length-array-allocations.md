---
description: Das .NET Allocation Tool identifiziert jetzt Array-Zuweisungen mit Null-Länge und trägt so zur Optimierung von Speichernutzung und Leistung bei.
area: Debugging & diagnostics
title: Insights zur Zuweisung von Arrays mit Null-Länge
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


Das .NET Allocation Tool bietet jetzt detaillierte Insights zu Array-Zuweisungen mit Null-Länge und hilft Ihnen, unnötige Speichernutzung zu identifizieren und zu optimieren. Auch wenn diese Zuweisungen einzeln betrachtet unbedeutend erscheinen mögen, können sie sich schnell ansammeln und die Leistung beeinträchtigen, insbesondere bei Hochleistungsanwendungen oder Anwendungen mit Speicherbeschränkungen.

![Natives Instrumentierungstool](../media/zero-length-array-allocations.mp4)

Mit diesem Update können Sie Zuweisungen von Arrays mit Null-Länge untersuchen, indem Sie auf den Link Untersuchen klicken, der die Zuweisungsansicht mit den Zuweisungsdetails öffnet. Wenn Sie doppelt klicken, sehen Sie die Code-Pfade, in denen diese Zuweisungen vorkommen, und können so präzise Optimierungen vornehmen. Um die Effizienz zu verbessern, sollten Sie `Array.Empty<T>()`, eine statisch zugewiesene leere Instanz des Arrays, verwenden, um redundante Speicherzuweisungen zu vermeiden.
