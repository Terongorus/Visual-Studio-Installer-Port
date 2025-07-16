---
description: NES, daha önce yapılmış düzenlemeleri değerlendirerek, ekleme, silme veya her ikisinin bir karışımı şeklinde bir sonraki düzenlemeyi tahmin eder.
area: GitHub Copilot
title: Sonraki Düzenleme Önerisi
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


Kodlama deneyiminizi daha da iyileştirmek için Sonraki Düzenleme Önerileri'nin veya kısaca NES'in Visual Studio'da kullanıma sunulduğunu duyurmaktan heyecan duyuyoruz. NES, daha önce yapılmış düzenlemeleri değerlendirerek, ekleme, silme veya her ikisinin bir karışımı şeklinde bir sonraki düzenlemeyi tahmin eder. NES, şapka işareti konumunuzda öneri oluşturmakla sınırlı olan Completions'ın aksine, bir sonraki düzenlemenin gerçekleşme olasılığının yüksek olduğu dosyanızın herhangi bir yerinde size destek olabilir. NES, geliştiricilerin kod düzenleme etkinliklerini destekleyerek mevcut Copilot Tamamlamaları deneyimini artırır.

### NES Kullanmaya Başlarken
**Araçlar > Seçenekler > GitHub > Copilot > Copilot Tamamlamalar > Sonraki Düzenleme Önerilerini Etkinleştir** aracılığıyla NES'i etkinleştirin.

Tamamlamalar gibi, NES almak için yapmanız gereken tek şey kodlamaya başlamak

Size bir düzenleme önerisi sunulduğunda, bu öneri şu anda bulunduğunuz satırdan farklı bir satırdaysa öncelikle sizi **Sekme tuşuna basarak ilgili satıra gitmeniz** için yönlendirecektir. Artık ilgili düzenlemeleri el ile aramanıza gerek kalmayacak; NES size yol gösterecek.

 ![NES Sekmeyle Atlama İpucu Çubuğu](../media/NES-Tab-Jump.png)

Düzenlemeyle aynı satıra geldikten sonra öneriyi **Kabul Etmek İçin Sekme** tuşuyla kabul edebilirsiniz.

  ![İpucu Çubuğunu Kabul Etmek için NES Sekmesi](../media/NES-Tab-Accept.png)

Not: İpucu çubuklarını açmak/kapatmak için **Araçlar > Seçenekleri > IntelliCode > Gelişmiş > Gri metinle gösterilen ipucunu gizle** bölümüne gidebilirsiniz. 

İpucu çubuklarına ek olarak bir düzenleme önerisi olduğunu belirtmek için cilt payı içindeki bir ok da açılır. Düzenleme önerisi menüsünü keşfetmek için ok tuşuna tıklayabilirsiniz.

  ![NES Cilt Payı Ok Tuşu](../media/NES-Gutter-Arrow.png)


### Örnek Senaryolar
Sonraki düzenleme önerileri çeşitli senaryolarda yararlı olabilir, yalnızca belirgin yinelenen değişiklikler yapmakla kalmaz, aynı zamanda mantıksal değişiklikler de yapabilir. Burada bazı örnekler verilmiştir:

**Bir 2B Nokta sınıfının 3B Nokta sınıfına yeniden düzenlenmesi:**
 
![NES Yeniden Düzenleme Noktası Sınıfı](../media/NES-Point.mp4)

**STL kullanarak kod söz dizimlerini modern C++ ile güncelleştirmek:**

NES'in sadece tüm `printf()` öğelerini `std::cout` olarak güncelleştirme gibi yinelenen değişiklikler yapmadığını, aynı zamanda `fgets()` gibi diğer sözdizimlerini de güncelleştirdiğini unutmayın.

![NES C++ Söz Dizimlerini Güncelleştirmek](../media/NES-Migration.mp4)

**Yeni eklenen değişkene yanıt olarak mantıksal değişiklikler yapmak:**

NES, bir oyuncunun oyunda yapabileceği maksimum tahmin sayısını ekleyen yeni değişkene hızlı bir şekilde yanıt verir ve Copilot Tamamlamaları da yardım etmek için devreye girmektedir.

![NES Yeni Değişken Ekle](../media/NES-AddVariable.mp4)

### Bunu denemek ister misiniz?
GitHub Copilot Ücretsiz'i etkinleştirin ve bu Yapay Zeka özelliğinin yanı sıra çok daha fazlasının kilidini açın.
Deneme yok. Kredi kartı yok. Yalnızca GitHub hesabınız. [Copilot Ücretsiz'i edinin](https://github.com/settings/copilot).
