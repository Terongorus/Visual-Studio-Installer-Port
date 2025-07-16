---
description: 使用此新设置，在重新启动之间保持 Git 仓库窗口打开。
area: Git tooling
title: 还原 Git 仓库窗口
thumbnailImage: ../media/restore-git-repository-window-thumbnail.png
featureId: restoregitrepositorywindow
devComUrl: https://developercommunity.visualstudio.com/t/Git-Repository-window-is-not-restored-in/1255797

---


作为分支操作的专用环境，[Git 仓库窗口](vscmd://Team.Git.GoToGitSynchronization) {KeyboardShortcut:Team.Git.GoToGitSynchronization} 可能是日常开发的核心。 如果你发现自己经常在每次 Visual Studio 会话中重新打开它，则此更新旨在为你节省时间和精力。

![Git 仓库窗口分支列表。](../media/restore-git-repository-window-thumbnail.png)

我们在 [Git > 设置](vscmd://Team.Git.Settings)中添加了一个新设置，可在重启 Visual Studio 时自动还原“Git 仓库”窗口。 此外，该窗口将包含在你保存的窗口布局中，从而增强自定义选项。

默认情况下，该功能是关闭的，目的是确保不需要的人不受影响。 但如果你喜欢便利性，这个设置非常适合你。

![“Git 设置”页，其中包含“还原 Git 仓库”窗口复选框。](../media/restore-git-repository-window-setting.png)
