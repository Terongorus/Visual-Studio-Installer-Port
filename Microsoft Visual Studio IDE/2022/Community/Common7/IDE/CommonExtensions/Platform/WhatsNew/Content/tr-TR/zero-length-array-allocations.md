---
description: .NET Ayırma Aracı artık sıfır uzunluklu dizi ayırmalarını tanımlayarak bellek kullanımını ve performansını iyileştirmeye yardımcı olur.
area: Debugging & diagnostics
title: Sıfır Uzunluklu Dizi Ayırma İçgörüleri
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


.NET Ayırma Aracı artık sıfır uzunluklu dizi ayırmaları hakkında ayrıntılı içgörüler sunarak gereksiz bellek kullanımını belirlemenize ve iyileştirmenize yardımcı olur. Bu ayırmalar tek başına önemsiz gibi görünse de, özellikle yüksek performanslı veya belleğin kısıtlı olduğu uygulamalarda hızlı bir şekilde birikebilir ve performansı etkileyebilir.

![Yerel İzleme Aracı](../media/zero-length-array-allocations.mp4)

Bu güncelleştirmeyle ayırma ayrıntılarını görüntüleyen Ayırma Görünümü'nü açan Araştır bağlantısına tıklayarak sıfır uzunluklu dizi ayırmalarını araştırabilirsiniz. Çift tıklama, bu ayırmaların gerçekleştiği kod yollarını ortaya çıkararak hassas iyileştirmeler sağlar. Verimliliği artırmak için, gereksiz bellek ayırmalarını ortadan kaldırmak için `Array.Empty<T>()` gibi statik olarak ayrılmış boş bir dizi örneği kullanmayı göz önünde bulundurun.
