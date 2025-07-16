---
description: インクルード補完を構成すると、インクルード補完リストに表示されるヘッダーを制御できます。
area: C++
title: 構成可能なインクルード補完
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


`#include` を入力するときにインクルード補完リストに表示されるヘッダーを制御できるようになりました。

**[ツール] > [オプション] > [テキスト エディター] > [C/C++] > [IntelliSense] > [候補のスタイルを含める]** にあるドロップダウン設定が、インクルード提案とインクルード補完の両方に影響するようになり、以下の動作調整が行われました。

- **Core Guidelines (既定)**: 相対パスには引用符を使用し、それ以外のすべての場合は山かっこを使用します。
- **引用符モード**: 山かっこを使用する標準ヘッダーを除き、すべてのヘッダーに引用符を使用します。
- **山かっこモード**: インクルード パスの一部であるすべてのヘッダーに山かっこを使用します。

![提案の設定のインクルード スタイル](../media/IncludeStyleSuggestionsSetting.png)

従来は、使用されている構文に関係なく、(相対ヘッダーを除く) すべてのヘッダーが提案に表示されていました。 今回の更新で、`#include <> and #include ""` を使用するときにヘッダーの提案がどのように表示されるかを調整できるようになりました。
