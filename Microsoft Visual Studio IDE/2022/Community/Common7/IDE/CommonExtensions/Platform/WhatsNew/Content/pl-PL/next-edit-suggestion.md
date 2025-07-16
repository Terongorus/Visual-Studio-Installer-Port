---
description: Funkcja NES przewiduje na podstawie poprzednich edycji następną edycję, którą może być wstawienie, usunięcie albo zarówno wstawienie, jak i usunięcie.
area: GitHub Copilot
title: Sugestia dotycząca następnej edycji
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Z przyjemnością ogłaszamy sugestie następnej edycji lub NES, które są teraz dostępne w programie Visual Studio, aby jeszcze bardziej usprawnić kodowanie. Funkcja NES przewiduje na podstawie poprzednich edycji następną edycję, którą może być wstawienie, usunięcie albo zarówno wstawienie, jak i usunięcie. W przeciwieństwie do funkcji Completions, która ogranicza się do generowania sugestii w miejscu, w którym znajduje się kursor, funkcja NES może pomóc w dowolnym miejscu pliku, w którym najprawdopodobniej nastąpi kolejna edycja. NES rozszerza istniejące środowisko uzupełniania Copilot, aby ułatwić deweloperom edytowanie kodu.

### Wprowadzenie do korzystania z platformy NES
Jeśli chcesz włączyć NES, wybierz **Narzędzia > Opcje > GitHub > Copilot > Uzupełnienia funkcji Copilot > Włącz sugestie następnej edycji.**

Podobnie jak w przypadku uzupełnień, aby zacząć otrzymywać NES musisz tylko rozpocząć kodowanie!

Jeśli sugestia edycji dotyczy innego wiersza niż ten, w którym się znajdujesz, najpierw otrzymasz sugestię **przejścia do tego wiersza za pomocą klawisza Tab**. Nie musisz już ręcznie szukać powiązanych edycji; NES wskaże drogę!

 ![Pasek wskazówki przejścia za pomocą klawisza Tab NES](../media/NES-Tab-Jump.png)

Jeśli edycja dotyczy tego wiersza, w którym się znajdujesz możesz nacisnąć klawisz **Tab, aby zaakceptować** sugestię.

  ![Pasek wskazówki zaakceptowania za pomocą klawisza Tab NES](../media/NES-Tab-Accept.png)

Uwaga: jeśli chcesz włączyć/wyłączyć paski wskazówek, wybierz **Narzędzi > Opcje > IntelliCode > Zaawansowane > Ukryj poradę wyświetlaną z szarym tekstem**. 

Oprócz pasków wskazówek na marginesie jest też wyświetlana strzałka sygnalizująca dostępność sugestii edycji. Jeśli klikniesz tę strzałkę, zostanie wyświetlone menu sugestii edycji.

  ![Strzałka na marginesie NES](../media/NES-Gutter-Arrow.png)


### Przykładowe scenariusze
Sugestie następnej edycji mogą być przydatne w różnych scenariuszach, nie tylko wprowadzania oczywistych powtarzających się zmian, ale także zmian logicznych. Oto kilka przykładów:

**Refaktoryzacja klasy punktu 2D na punkt 3D:**
 
![Refaktoryzacja klasy punktu NES](../media/NES-Point.mp4)

**Aktualizowanie składni kodu zgodnie z wymogami nowoczesnego języka C++ przy użyciu STL:**

Należy pamiętać, że funkcja NES nie tylko wprowadza powtarzające się zmiany, takie jak aktualizowanie wszystkich `printf()` według `std::cout`, ale także aktualizuje inne składnie, takich jak `fgets()`.

![Aktualizowanie składni języka C++ przez NES](../media/NES-Migration.mp4)

**Wprowadzanie zmian logicznych w reakcji na nowo dodaną zmienną:**

NES szybko reaguje na nową zmienną, która dodaje maksymalną liczbę trafień gracza w grze, a pomagają w tym także uzupełnienia funkcji Copilot.

![Dodawanie nowej zmiennej NES](../media/NES-AddVariable.mp4)

### Chcesz ją wypróbować?
Aktywuj darmową aplikację GitHub Copilot i odblokuj tę funkcję sztucznej inteligencji oraz wiele innych.
Brak wersji próbnej. Brak karty kredytowej. Wystarczy twoje konto usługi GitHub. [Uzyskaj bezpłatnie Copilot](https://github.com/settings/copilot).
