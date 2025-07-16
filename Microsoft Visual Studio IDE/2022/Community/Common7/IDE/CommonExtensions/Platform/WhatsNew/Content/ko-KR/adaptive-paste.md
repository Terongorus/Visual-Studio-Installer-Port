---
description: 이제 Copilot가 기존 코드의 컨텍스트에 맞게 붙여넣은 코드를 조정하도록 할 수 있습니다.
area: GitHub Copilot
title: 적응형 붙여넣기
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


Visual Studio에 코드를 붙여넣을 때 원활하게 작동하려면 추가 단계가 필요한 경우가 많습니다. 솔루션에 이미 사용된 매개 변수와 일치하도록 매개 변수를 조정해야 하거나 구문 및 스타일이 문서의 나머지 부분과 일치하지 않을 수 있습니다.

적응형 붙여넣기는 기존 코드의 컨텍스트에 맞게 붙여넣은 코드를 자동으로 조정하여 시간을 절약하고 작업을 줄여서 수동 수정의 필요성을 최소화합니다. 이 기능은 사소한 오류 수정, 코드 스타일 지정, 서식 지정, 사용자 및 코드 언어 번역, 빈 채우기 또는 계속 패턴 작업과 같은 시나리오도 지원합니다.

예를 들어, `Math` 클래스가 `IMath` 인터페이스를 구현하는 경우, `Ceiling` 메서드의 구현을 같은 파일에 복사하여 붙여넣으면 아직 구현되지 않은 인터페이스 멤버 `Floor`를 구현하도록 자동으로 적응합니다.

![붙여넣은 메서드를 조정하여 인터페이스 완료](../media/adaptive-paste-complete-interface.mp4)

{KeyboardShortcut:Edit.Paste}을(를) 정기적으로 붙여넣으면 적응형 붙여넣기 UI가 나타납니다. 키를 눌러 `TAB` 제안을 요청하면 원래 붙여넣은 코드와 조정된 코드를 비교하는 diff가 표시됩니다.

오늘 **도구 > 옵션 > GitHub > Copilot > 편집기 > 적응형 붙여넣기** 사용 옵션을 사용하도록 설정하여 사용해 보세요.

### 이 작업을 시도해 보시겠습니까?
GitHub Copilot Free를 활성화하고 이 AI 기능의 잠금을 해제합니다.
평가판 없음 신용카드 없음. 귀하의 GitHub 계정만. [Copilot 무료로 사용하기](https://github.com/settings/copilot).
