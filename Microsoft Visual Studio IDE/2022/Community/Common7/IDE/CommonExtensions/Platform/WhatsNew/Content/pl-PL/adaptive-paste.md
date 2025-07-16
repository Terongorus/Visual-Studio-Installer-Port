---
description: Teraz możesz zezwolić aplikacji Copilot na korygowanie wklejanego kodu w celu dostosowania go do kontekstu istniejącego kodu.
area: GitHub Copilot
title: Adaptacyjne wklejanie
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Podczas wklejania kodu do programu Visual Studio często są wymagane dodatkowe kroki, aby działał on dobrze. Może być konieczne dostosowanie parametrów do tych, które są już używane w rozwiązaniu. Czasami też składnia i styl mogą być inne niż w reszcie dokumentu.

Funkcja wklejania z adaptacją pozwala zaoszczędzić czas i zmniejszyć nakład pracy dzięki automatycznemu dostosowaniu wklejanego kodu do kontekstu istniejącego kodu, aby zminimalizować konieczność ręcznej modyfikacji. Ta funkcja obsługuje również scenariusze, takie jak poprawianie drobnych błędów, stylizowanie kodu, formatowanie, tłumaczenie i konwersja języka kodu oraz zadania uzupełniania lub kontynuowania wzorca.

Jeśli na przykład masz klasę `Math`, która implementuje interfejs `IMath`, kopiowanie i wklejanie implementacji metody `Ceiling` w tym samym pliku dostosuje go do implementacji jeszcze nie zaimplementowanego elementu członkowskiego `Floor` interfejsu.

![Metoda wklejania z adaptacją uzupełniająca interfejs](../media/adaptive-paste-complete-interface.mp4)

Interfejs użytkownika wklejania z adaptacją jest wyświetlany podczas wykonywania zwykłego wklejania {KeyboardShortcut:Edit.Paste}. Wystarczy nacisnąć `TAB`, aby poprosić o sugestię, a wtedy zostanie wyświetlona różnica między pierwotnym wklejonym kodem a skorygowanym kodem.

Jeśli chcesz spróbować, jak to działa, wybierz **Narzędzia > Opcje > GitHub > Copilot > Edytor > Włącz adaptacyjne wklejanie**.

### Chcesz ją wypróbować?
Aktywuj darmową aplikację GitHub Copilot i odblokuj tę funkcję sztucznej inteligencji oraz wiele innych.
Brak wersji próbnej. Brak karty kredytowej. Wystarczy twoje konto usługi GitHub. [Uzyskaj bezpłatnie Copilot](https://github.com/settings/copilot).
