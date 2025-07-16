---
description: Narzędzie alokacji platformy .NET identyfikuje teraz alokacje tablic o zerowej długości, pomagając zoptymalizować użycie pamięci i wydajność.
area: Debugging & diagnostics
title: Szczegółowe informacje o alokacji tablicy o zerowej długości
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


Narzędzie alokacji platformy .NET udostępnia teraz szczegółowe informacje na temat alokacji tablic o zerowej długości, pomagając identyfikować i optymalizować niepotrzebne użycie pamięci. Chociaż te alokacje pojedynczo mogą wydawać się nieistotne, mogą się one szybko gromadzić i wpływać na wydajność, szczególnie w aplikacjach z wymaganiami wysokiej wydajności lub pamięci.

![Natywne narzędzie instrumentacji](../media/zero-length-array-allocations.mp4)

Dzięki tej aktualizacji można zbadać alokacje tablic o zerowej długości, klikając link Zbadaj, co spowoduje otwarcie widoku alokacji zawierającego szczegóły alokacji. Kliknięcie dwukrotne wyświetla ścieżki kodu, w których występują te alokacje, umożliwiając precyzyjne optymalizacje. Aby zwiększyć wydajność, rozważ użycie `Array.Empty<T>()` statycznie przydzielonego wystąpienia pustej tablicy w celu wyeliminowania nadmiarowych alokacji pamięci.
