---
description: Aktualizacje ogólnie dostępne dla zestawu narzędzi Teams Toolkit 17.14.
area: IDE
title: Zestaw narzędzi Microsoft 365 Agents Toolkit
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


Z przyjemnością ogłaszamy, że nasz produkt, wcześniej znany jako Zestaw narzędzi Teams Toolkit, został zmieniony na Zestaw narzędzi Microsoft 365 Agents Toolkit. Ta zmiana odzwierciedla nasz rozszerzony nacisk i zaangażowanie w obsługę szerszego zakresu platform i typów projektów w ekosystemie Microsoft 365.

W miarę dalszego ulepszania naszego produktu, rozszerzamy nasze działania i zamiast skupiać się wyłącznie na rozwoju aplikacji Teams, będziemy koncentrować się na wspieraniu deweloperów w budowaniu agentów Microsoft 365 Copilot oraz innych aplikacji na platformie Microsoft 365. Te platformy obejmują platformy Microsoft 365 Copilot, Microsoft Teams, rodzinę pakietu Office i program Outlook. Ta ekspansja pozwala nam lepiej obsługiwać naszych użytkowników, udostępniając kompleksowe narzędzia, szablony i zasoby na potrzeby tworzenia wielu różnych rozwiązań w ramach platformy Microsoft 365.

Nowa nazwa zestawu narzędzi Microsoft 365 Agents Toolkit lepiej reprezentuje różnorodne funkcje i możliwości naszego produktu. Uważamy, że ta zmiana pomoże naszym użytkownikom łatwiej zidentyfikować pełny zakres możliwości programowania dostępnych w środowisku platformy Microsoft 365.

Dziękujemy za nieustające wsparcie w trakcie naszego rozwoju, aby sprostać rosnącym potrzebom naszej społeczności deweloperów.


### Tworzenie agenta deklaratywnego 

Z przyjemnością informujemy, że w tej wersji dodaliśmy szablony projektów do tworzenia deklaratywnych agentów dla usługi Microsoft 365 Copilot.

![Tworzenie projektu DA](../media/atk_da_create.png)

Możesz utworzyć agenta deklaratywnego z akcją lub bez akcji. Możesz zdefiniować nowe interfejsy API lub użyć istniejących do wykonywania zadań lub pobierania danych.

Debugowanie i wyświetlanie podglądu agentów deklaratywnych w rozwiązaniu Microsoft Copilot za pomocą zestawu narzędzi Microsoft 365 Agents Toolkit.

### Włącz bezproblemowe debugowanie jednym kliknięciem
W poprzednich wersjach narzędzia Teams Toolkit, które jest teraz nazywane Microsoft 365 Agents Toolkit, gdy użytkownicy debugowali dowolne wygenerowane rozwiązanie, przed debugowaniem projektu należało użyć polecenia **Przygotuj zależność aplikacji Teams**. To polecenie uruchomiło zestaw narzędzi, aby ułatwić deweloperom tworzenie niezbędnych zasobów na potrzeby debugowania, takich jak rejestrowanie lub aktualizowanie aplikacji Teams.

Aby ulepszyć środowisko debugowania i uczynić je bardziej intuicyjnym dla użytkowników programu Visual Studio, usunęliśmy ten krok i włączyliśmy środowisko debugowania jednym kliknięciem. Teraz możesz bezpośrednio kliknąć przycisk debugowania bez żadnych kroków przygotowania. Jeśli jednak wprowadzono zmiany w aplikacji między dwoma zdarzeniami debugowania i trzeba zaktualizować aplikację, nadal istnieje opcja, aby to zrobić.
Oferujemy dwa profile debugowania:

![debugowanie profilów](../media/atk_debug_profiles.png)

- **Debugowanie z aktualizowaniem aplikacji**: wybierz domyślny profil `[Your Target Launch Platform] (browser)`, jeśli wprowadzono zmiany w aplikacji, aby upewnić się, że aktualizacje są zastosowane.
- **Debugowanie bez aktualizowania aplikacji**: wybierz drugi profil `[Your Target Launch Platform] (browser) (skip update app) `, aby pominąć aktualizowanie zasobów aplikacji Teams, co ułatwia i przyspiesza debugowanie.

### Uaktualnianie do platformy .NET 9

Ponadto w tej wersji zestawu narzędzi poprawiliśmy wszystkie szablony projektów, aby obsługiwały platformę .NET 9.

![Obsługa platformy ,net9](../media/atk_net9.png)

**Udanego kodowania!**  
*Zespół ds. zestawu narzędzi Microsoft 365 Agents Toolkit*
