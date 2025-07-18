---
description: Расширенный интерфейс для отладки выражений LINQ с подсказками по данным, которые отображаются при наведении курсора на предложение.
area: Debugging & diagnostics
specUrl: 
title: Показ подсказок по данным для выражений LINQ
thumbnailImage: ../media/linq-datatip-thumbnail.png
featureId: linq-datatip
devComUrl: https://developercommunity.visualstudio.com/t/Integrated-Linq-Editor/442398

---


Создавать запросы LINQ и устранять связанные с ними неполадки порой бывает сложно и утомительно, и зачастую для этого необходимо досконально знать синтаксис, а также перебрать множество разных вариантов. Для решения этих проблем мы добавили в отладчик Visual Studio 2022 подсказки по данным, которые отображаются при наведении курсора на запрос LINQ.

При отладке можно моментально определить значение, которое вернет запрос при выполнении, наведя курсор на какие-то отдельные предложения или сегменты запроса LINQ.

Кроме того, вы можете щелкнуть значок GitHub Copilot в конце подсказки по данным, чтобы выполнить функцию *Анализировать с помощью Copilot* для того предложения запроса, на которое вы навели курсор. После этого Copilot истолкует синтаксис предложения и сообщит, почему вы получаете приведенный результат.

![Пример подсказки по данным, которая отображается при наведении курсора на запрос LINQ](../media/linq-hover-example.png)

Эта функция существенно упрощает отладку и повышает ее эффективность, поскольку ускоряет выявление проблем с запросами LINQ и оптимизирует процесс разработки в целом.

### Хотите попробовать?
Активируйте GitHub Copilot Free и получите доступ к этой ИИ-функции, а также другие возомжности.
Никаких пробных периодов. Не нужна кредитная карта. Только ваша учетная запись на GitHub. [Скачать Copilot Free](https://github.com/settings/copilot).
