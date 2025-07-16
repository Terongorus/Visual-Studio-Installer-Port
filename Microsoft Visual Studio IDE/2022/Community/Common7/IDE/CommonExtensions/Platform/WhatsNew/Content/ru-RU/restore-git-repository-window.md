---
description: Этот новый параметр позволяет настроить окно репозитория Git так, чтобы оно оставалось открытым в периоды от одного перезапуска до другого.
area: Git tooling
title: Восстановление окна репозитория Git
thumbnailImage: ../media/restore-git-repository-window-thumbnail.png
featureId: restoregitrepositorywindow
devComUrl: https://developercommunity.visualstudio.com/t/Git-Repository-window-is-not-restored-in/1255797

---


Поскольку [окно репозитория Git](vscmd://Team.Git.GoToGitSynchronization) {KeyboardShortcut:Team.Git.GoToGitSynchronization} — это выделенная среда для операций ветви, вероятно, вы пользуетесь им каждый день во время разработки. Если вы регулярно, в каждом сезоне Visual Studio, снова открываете это окно, это обновление поможет сэкономить вам время и силы.

![Список ветвей в окне репозитория Git.](../media/restore-git-repository-window-thumbnail.png)

Мы добавили в раздел [Git > Настройки](vscmd://Team.Git.Settings) новый параметр, который позволяет автоматически восстанавливать окно репозитория Git при перезапуске Visual Studio. Кроме того, данное окно будет включено в макеты окон, которые вы сохранили, что предоставляет вам дополнительные возможности для персонализации.

По умолчанию эта функция отключена, чтобы не мешать работать тем, кому она не нужна. Но если вы стремитесь к комфорту, эта настройка вам идеально подойдет.

![Страница "Параметры Git" с флажком "Восстановить окно репозитория Git".](../media/restore-git-repository-window-setting.png)
