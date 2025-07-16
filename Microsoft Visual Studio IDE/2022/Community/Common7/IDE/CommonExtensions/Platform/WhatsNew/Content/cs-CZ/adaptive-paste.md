---
description: Copilot nyní může upravit vložený kód tak, aby odpovídal kontextu existujícího kódu.
area: GitHub Copilot
title: Adaptivní vkládání
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Při vkládání kódu do sady Visual Studio jsou často nutné další kroky, aby tento kód správně fungoval. Může být například třeba upravit parametry s ohledem na ty, které už v řešení používáte, nebo přizpůsobit syntaxi a styl zbytku dokumentu.

Adaptivní vložení šetří čas a úsilí tím, že automaticky upraví vložený kód tak, aby odpovídal kontextu stávajícího kódu a minimalizoval potřebu ručních úprav. Tato funkce také pomáhá s opravami menších chyb, úpravou stylu kódu, formátováním, překladem běžných i programovacích jazyků a doplňováním prázdných nebo opakujících se sekvencí.

Například pokud máte třídu `Math` která implementuje rozhraní `IMath`, kopírování a vložení implementace metody `Ceiling` do stejného souboru zajistí přizpůsobení implementace s ohledem na dosud neimplementovaný člen rozhraní `Floor`.

![Dokončení rozhraní adaptivním vložením metody](../media/adaptive-paste-complete-interface.mp4)

Uživatelské rozhraní adaptivního vkládání se zobrazí při provádění běžného vložení {KeyboardShortcut:Edit.Paste}. Jednoduchým stisknutím klávesy `TAB` si můžete vyžádat návrh a aplikace zobrazí rozdíl původního vkládaného kódu a upraveného kódu.

Vyzkoušejte tuto funkci ještě dnes. Stačí povolit možnosti **Nástroje > Možnosti > GitHub > Copilot > Editor > Povolit adaptivní vkládání**.

### Chcete to vyzkoušet?
Aktivujte nástroj GitHub Copilot Free a odemkněte tuto funkci využívající umělou inteligenci a mnoho dalších.
 Žádná zkušební verze. Žádná platební karta. Jen váš účet GitHub. [Získejte nástroj Copilot Free](https://github.com/settings/copilot).
