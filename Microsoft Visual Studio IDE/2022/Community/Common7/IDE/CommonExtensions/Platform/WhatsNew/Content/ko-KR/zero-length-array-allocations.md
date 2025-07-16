---
description: .NET 할당 도구는 이제 제로 길이 배열 할당을 식별하여 메모리 사용과 성능 최적화를 돕습니다.
area: Debugging & diagnostics
title: 제로 길이 배열 할당 통찰
thumbnailImage: ../media/zero-length-array-allocations.png
featureId: zero-length-array-allocations

---


.NET 할당 도구는 이제 제로 길이 배열 할당에 대한 자세한 통찰을 제공하여 불필요한 메모리 사용을 식별하고 최적화하는 데 도움을 줍니다. 이 할당들은 개별적으로는 미미해 보일 수 있지만, 빠르게 누적되어 성능에 영향을 미칠 수 있으며, 특히 고성능 또는 메모리 제약이 있는 애플리케이션에서 더욱 그렇습니다.

![네이티브 계측 도구](../media/zero-length-array-allocations.mp4)

이 업데이트를 통해 "조사" 링크를 클릭하여 제로 길이 배열 할당을 조사할 수 있으며, 이 링크는 할당 세부 정보를 표시하는 할당 보기 화면을 엽니다. 더블 클릭하면 이러한 할당이 발생하는 코드 경로가 표시되어 정확한 최적화를 할 수 있습니다. 효율성을 개선하려면, 불필요한 메모리 할당을 제거하기 위해 `Array.Empty<T>()`을 사용하여 정적으로 할당된 빈 배열 인스턴스를 고려하십시오.
