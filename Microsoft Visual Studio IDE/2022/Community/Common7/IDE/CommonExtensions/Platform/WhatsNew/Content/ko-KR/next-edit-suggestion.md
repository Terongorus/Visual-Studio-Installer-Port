---
description: NES는 이전에 수행된 편집을 활용하여 다음 편집을 예측하며, 이는 삽입, 삭제 또는 둘의 조합이 될 수 있습니다.
area: GitHub Copilot
title: 다음 편집 제안
thumbnailImage: ../media/NES-Tab-Jump-thumb.png
featureId: next-edit-suggestion

---


다음 편집 제안, 줄여서 NES, 기능이 이제 Visual Studio에서 사용 가능하여 더욱 향상된 코딩 경험을 제공합니다. NES는 이전에 수행된 편집을 활용하여 다음 편집을 예측하며, 이는 삽입, 삭제 또는 둘의 조합이 될 수 있습니다. Completions가 커서 위치에서만 제안을 제공하는 데 반해, NES는 파일 내에서 다음 편집이 일어날 가능성이 높은 모든 위치에서 지원이 가능합니다. NES는 기존 Copilot 완성 경험을 강화하여 개발자의 코드 편집 작업을 지원합니다.

### NES 시작
NES를 통해 **도구 > 옵션 > GitHub > Copilot > Copilot 완성 > 다음 편집 제안 사용.**

완성 기능과 마찬가지로, NES를 사용하려면 그냥 코딩을 시작하기만 하면 됩니다!

편집 제안이 표시될 때 현재 위치한 줄과 다르면, 먼저 **Tab 키를 눌러 해당 줄로 이동**하도록 제안됩니다. 이제 관련된 편집을 수동으로 찾을 필요 없이, NES가 안내해 줍니다!

 ![NES 탭하여 힌트 표시줄 표시](../media/NES-Tab-Jump.png)

편집 제안과 동일한 줄에 도달하면, **탭 키를 눌러 수락** 할 수 있습니다.

  ![NES 탭하여 힌트 표시줄 수락](../media/NES-Tab-Accept.png)

참고: **도구 > 옵션 > IntelliCode > 고급 > 회색 텍스트로 표시된 팁숨기기**에서 힌트 바를 켜거나 끌 수 있습니다. 

힌트 바 외에도, 편집 제안이 있음을 나타내는 화살표가 코드 편집기의 줄 번호 영역에 표시됩니다. 화살표를 클릭하면 편집 제안 메뉴를 확인할 수 있습니다.

  ![NES 여백 화살표](../media/NES-Gutter-Arrow.png)


### 예제 시나리오
다음 편집 제안은 단순한 반복적인 변경뿐만 아니라 논리적인 변경에도 도움이 될 수 있습니다. 다음 몇 가지 예를 참조하세요.

**2D Point 클래스를 3D Point 클래스로 리팩터링:**
 
![NES 리팩터링 포인트 클래스](../media/NES-Point.mp4)

**STL을 사용하여 코드 구문을 최신 C++로 업데이트:**

NES는 단순히 모든 `printf()`을 `std::cout`로 변경하는 반복적인 작업뿐만 아니라, `fgets()`과 같은 다른 구문도 업데이트한다는 점에 유의하세요.

![NES C++ 구문 업데이트](../media/NES-Migration.mp4)

**새로 추가된 변수를 반영하여 논리적 변경 수행:**

NES는 플레이어가 게임에서 시도할 수 있는 최대 횟수를 추가하는 새로운 변수에 빠르게 반응하며, Copilot 완성도 이를 지원합니다.

![NES 새 변수 추가](../media/NES-AddVariable.mp4)

### 이 작업을 시도해 보시겠습니까?
GitHub Copilot Free를 활성화하고 이 AI 기능의 잠금을 해제합니다.
평가판 없음 신용카드 없음. 귀하의 GitHub 계정만. [Copilot 무료로 사용하기](https://github.com/settings/copilot).
