---
description: 既存のコードのコンテキストに合わせて、貼り付けたコードを Copilot で調整できるようになりました。
area: GitHub Copilot
title: アダプティブ貼り付け
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Visual Studio でコードを貼り付ける場合、シームレスに動作させるために追加の手順が必要になることがよくあります。 ソリューションで既に使用されているパラメーターに合わせてパラメーターを調整する必要が生じる場合や、構文とスタイルがドキュメントの残りの部分と一致していない場合があります。

アダプティブ貼り付けを使用すると、貼り付けたコードが既存のコードのコンテキストに合わせて自動的に調整され、手動による変更の必要性が最小限に抑えられるため、時間を節約し、労力を軽減できます。 この機能では、軽微なエラーの修正、コードのスタイル設定、書式設定、人間の言語とコード言語の翻訳、空白を埋めるタスク、パターンを繰り返すタスクといったシナリオもサポートされます。

たとえば、`Math` インターフェイスを実装する `IMath` クラスがある場合、`Ceiling` メソッドの実装をコピーして同じファイルに貼り付けることで、未実装のメンバー `Floor` を実装するようにその内容が調整されます。

![インターフェイスを補完するように貼り付けたメソッドを適応させする](../media/adaptive-paste-complete-interface.mp4)

通常の貼り付け {KeyboardShortcut:Edit.Paste} を実行すると、アダプティブ貼り付けの UI が表示されます。 `TAB`キーを押して提案を要求するだけで、元の貼り付けたコードと調整されたコードを比較する差分が表示されます。

**［ツール］ > ［オプション］ > ［GitHub］ > ［Copilot］ > ［エディター］ > [アダプティブ貼り付けを有効にする]** オプションを有効にして、今すぐお試しください。

### さっそくこれを試してみましょう。
GitHub Copilot Free をアクティブ化し、この AI 機能のロックを解除します。
試用版なし。 クレジット カード不可。 GitHub アカウントだけでいいのです。 [Copilotを無料でゲットしよう](https://github.com/settings/copilot)。
