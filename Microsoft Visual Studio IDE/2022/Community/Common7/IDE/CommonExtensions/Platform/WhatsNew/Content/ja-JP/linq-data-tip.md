---
description: データヒントをホバーする句を使用した LINQ 式のデバッグ エクスペリエンスが強化されました。
area: Debugging & diagnostics
specUrl: 
title: LINQ 式のデータヒントを表示する
thumbnailImage: ../media/linq-datatip-thumbnail.png
featureId: linq-datatip
devComUrl: https://developercommunity.visualstudio.com/t/Integrated-Linq-Editor/442398

---


LINQ クエリの生成とトラブルシューティングは、面倒で複雑なプロセスになりがちであり、正確な構文知識と多大なの反復作業が必要になる場合があります。 これらの課題を軽減するために、Visual Studio 2022 では、デバッガーに LINQ オンホバー データヒントが導入されます。

デバッグ中に中断状態になっている間は、LINQ クエリの個々の句またはセグメントにカーソルを合わせて、実行時に即座にクエリ値を評価できます。

さらに、データヒントの末尾にある GitHub Copilot アイコンをクリックすることで、カーソルを合わせた特定のクエリ句に対して *Copilot で分析*を実行できます。 それにより、Copilot が句の構文を説明し、指定された結果が取得される理由を明確にします。

![LINQ ホバー データヒントの例](../media/linq-hover-example.png)

この機能により、効率が大幅に向上し、デバッグ エクスペリエンスがより円滑かつ簡単になるため、LINQ クエリの問題をより迅速に特定し、開発ワークフロー全体を合理化できます。

### さっそくこれを試してみましょう。
GitHub Copilot Free をアクティブ化し、この AI 機能のロックを解除します。
試用版なし。 クレジット カード不可。 GitHub アカウントだけでいいのです。 [Copilotを無料でゲットしよう](https://github.com/settings/copilot)。
