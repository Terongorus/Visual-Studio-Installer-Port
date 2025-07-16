---
description: これで、Copilot で空の C# メソッドを完全に実装できるようになりました。
area: GitHub Copilot
title: Copilot を使用して実装する
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


現在、まだ実装されていない C# コード内のメソッドを参照している場合は、**[メソッドの生成]** という一般的な電球リファクタリングを使用して、そのメソッドをすぐにクラスに作成できます。 ただし、このリファクタリングでは、正しいシグネチャを持つメソッドのみが作成され、それ以外の場合は空のスケルトンと `throw new NotImplementedException` 行が作成されます。 つまり、メソッドは技術的には存在し、作成に必要な作業は少なくて済みますが、メソッドを自分で実装する必要があり、時間がかかる可能性があります。

**[Copilot で実装]** リファクタリングは、GitHub Copilot の助けを借りてメソッドを自動的に実装したり、*内容を追加*したりすることで、このシナリオで生産性を高めることがねらいです。 `NotImplementedException` スローのみを含む空のメソッドに検出された場合は、その `throw` 行の電球 (`CTRL+.`) を選択し、**[Copilot で実装]** リファクタリングを選択すると、Copilot が既存のコードベース、メソッド名などに基づいてメソッドの内容をすべて入力します。

![Copilot を使用して実装する](../media/implement-with-copilot.mp4)

### さっそくこれを試してみましょう。
GitHub Copilot Free をアクティブ化し、この AI 機能のロックを解除します。
試用版なし。 クレジット カード不可。 GitHub アカウントだけでいいのです。 [Copilotを無料でゲットしよう](https://github.com/settings/copilot)。
