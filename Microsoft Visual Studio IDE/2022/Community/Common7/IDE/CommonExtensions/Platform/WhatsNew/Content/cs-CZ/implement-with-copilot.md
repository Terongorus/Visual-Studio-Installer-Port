---
description: Nyní můžete nechat funkci Copilot, aby plně implementovala prázdnou metodu v jazyce C#.
area: GitHub Copilot
title: Implementace s funkcí Copilot
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


Pokud odkazujete na metodu psanou v jazyce C#, která ještě nebyla implementována, můžete dnes k okamžitému vytvoření této metody ve třídě použít běžný refaktoring (symbol žárovky) s názvem **Generování metody**. Tento refaktoring však vytvoří pouze metodu se správnou signaturou, avšak s prázdnou kostru a řádkem `throw new NotImplementedException`. To znamená, že i když technicky metoda existuje a k jejímu vytvoření stačí vykonat méně práce, stejně budete muset tuto metodu implementovat sami, což už může trvat déle.

Cílem refaktoringu **Implementace s funkcí Copilot** je zvýšit v takovéto situaci produktivitu ještě více tím, že vám umožní automaticky implementovat nebo *přidat základní kód* do vaší metody pomocí funkce GitHub Copilot. Pokud je zjištěna prázdná metoda obsahující pouze vyvolání `NotImplementedException`, můžete na daném řádku vybrat žárovku (`CTRL+.`) `throw`, vybrat refaktoring **Implementace s funkcí Copilot** a funkce Copilot vyplní veškerý obsah vaší metody na základě existující kódové báze, názvu metody atd.

![Implementace s funkcí Copilot](../media/implement-with-copilot.mp4)

### Chcete to vyzkoušet?
Aktivujte nástroj GitHub Copilot Free a odemkněte tuto funkci využívající umělou inteligenci a mnoho dalších.
 Žádná zkušební verze. Žádná platební karta. Jen váš účet GitHub. [Získejte nástroj Copilot Free](https://github.com/settings/copilot).
