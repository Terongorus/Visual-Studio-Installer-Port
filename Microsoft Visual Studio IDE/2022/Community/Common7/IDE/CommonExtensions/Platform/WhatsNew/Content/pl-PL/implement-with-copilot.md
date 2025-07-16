---
description: Możesz teraz pozwolić Copilotowi w pełni zaimplementować pustą metodę C#.
area: GitHub Copilot
title: Implementacja za pomocą narzędzia Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Obecnie, jeśli odwołujesz się do metody w kodzie C#, która nie została jeszcze zaimplementowana, możesz użyć typowego refaktoryzowania typu lightbulb o nazwie **Generate Method**, aby natychmiast utworzyć tę metodę w klasie. Jednak to refaktoryzowanie tworzy tylko metodę z poprawnym podpisem, ale pusty szkielet i wiersz `throw new NotImplementedException`. Oznacza to, że chociaż metoda technicznie istnieje i utworzenie jej wymaga mniej pracy, nadal należy zaimplementować metodę samodzielnie, co może zająć więcej czasu.

Refaktoryzacja **Implementacja za pomocą Copilota** ma na celu zwiększenie produktywności w tym scenariuszu, umożliwiając automatyczną implementację lub *dodanie istotnej zawartości* do Twojej metody za pomocą narzędzia GitHub Copilot. W przypadku napotkania pustej metody zawierającej tylko rzut `NotImplementedException` możesz wybrać żarówkę (`CTRL+.`) w tym wierszu `throw` i wybrać refaktoryzację **Implementacja za pomocą Copilota**, a Copilot wypełni całą zawartość Twojej metody na podstawie istniejącej bazy kodu, nazwy metody itd.

![Implementacja za pomocą narzędzia Copilot](../media/implement-with-copilot.mp4)

### Chcesz ją wypróbować?
Aktywuj darmową aplikację GitHub Copilot i odblokuj tę funkcję sztucznej inteligencji oraz wiele innych.
Brak wersji próbnej. Brak karty kredytowej. Wystarczy twoje konto usługi GitHub. [Uzyskaj bezpłatnie Copilot](https://github.com/settings/copilot).
