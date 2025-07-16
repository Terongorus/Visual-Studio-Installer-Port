---
description: Przy użyciu tego nowego ustawienia pozostaw otwarte okno Repozytorium Git między ponownymi uruchomieniami.
area: Git tooling
title: Przywracanie okna repozytorium Git
thumbnailImage: ../media/restore-git-repository-window-thumbnail.png
featureId: restoregitrepositorywindow
devComUrl: https://developercommunity.visualstudio.com/t/Git-Repository-window-is-not-restored-in/1255797

---


Jako środowisko dedykowane operacjom gałęzi [okno repozytorium Git](vscmd://Team.Git.GoToGitSynchronization) {KeyboardShortcut:Team.Git.GoToGitSynchronization} prawdopodobnie jest podstawą codziennego programowania. Jeśli często otwierasz je ponownie przy każdej sesji programu Visual Studio, ta aktualizacja została zaprojektowana tak, aby zaoszczędzić czasu i nakładów pracy.

![Lista gałęzi okna repozytorium Git.](../media/restore-git-repository-window-thumbnail.png)

Dodaliśmy nowe ustawienie do [Usługi Git > Ustawienia](vscmd://Team.Git.Settings), które automatycznie przywraca okno repozytorium Git podczas ponownego uruchamiania programu Visual Studio. Ponadto to okno zostanie uwzględnione w zapisanych układach okien, dzięki czemu zwiększają się możliwości dostosowywania.

Domyślnie ta funkcja jest wyłączona, aby zapewnić bezproblemowe działanie dla tych, którzy jej nie potrzebują. Ale jeśli podoba Ci się wygoda, to ustawienie jest idealne dla Ciebie.

![Strona Ustawienia usługi Git z polem wyboru przywracania repozytorium Git.](../media/restore-git-repository-window-setting.png)
