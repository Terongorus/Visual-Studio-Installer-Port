---
description: Ekleme tamamlamanın yapılandırılması, ekleme tamamlama listesinde hangi üst bilgilerin görüneceğini denetlemenizi sağlar.
area: C++
title: Yapılandırılabilir Ekleme Tamamlama
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


Artık `#include` yazdığınızda ekleme tamamlama listesinde hangi üst bilgilerin görüneceğini denetleyebilirsiniz.

**Araçlar > Seçenekler > Metin Düzenleyici > C/C++ > IntelliSense > Öneriler için stil ekleyin** altında açılan ayar artık aşağıdaki iyileştirilmiş davranışlarla hem önerileri dahil etmeyi hem de tamamlamayı dahil etmeyi etkiliyor:

- **Temel Yönergeler (Varsayılan)**: Göreli yollar için tırnak işaretleri ve diğer her şey için açılı ayraçlar kullanır.
- **Tırnak işaretleri**: Açılı ayraç kullanan standart üst bilgiler dışındaki tüm üst bilgiler için tırnak işaretleri kullanır.
- **Açılı ayraç**: Ekleme yolunun parçası olan tüm üst bilgiler için açılı ayraçları kullanır.

![Öneriler için Stil Ekleyin Ayarı](../media/IncludeStyleSuggestionsSetting.png)

Daha önce, kullanılan söz dizimine bakılmaksızın önerilerde tüm üst bilgiler (göreli olanlar hariç) görünüyordu. Bu güncelleştirmeyle, `#include <> and #include ""` kullanırken üst bilgi önerilerinin nasıl görüneceğini belirleyebilirsiniz.
