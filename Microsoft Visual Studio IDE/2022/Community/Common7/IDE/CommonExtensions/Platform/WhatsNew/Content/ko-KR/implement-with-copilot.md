---
description: 이제 Copilot이 빈 C# 메서드를 완전히 구현하도록 할 수 있습니다.
area: GitHub Copilot
title: Copilot을 사용하여 구현하기
thumbnailImage: ../media/implement-with-copilot.png
featureId: implement-with-copilot

---


현재 C# 코드에서 아직 구현되지 않은 메서드를 참조하고 있는 경우, 일반적인 전구 아이콘 리팩터링 기능인 **메서드 생성**을 사용하여 해당 메서드를 클래스에 즉시 생성할 수 있습니다. 그러나 이 리팩터링에서는 올바른 서명이 있는 메서드만 만들지만, 그렇지 않으면 빈 골격과 `throw new NotImplementedException` 선만 만듭니다. 즉, 메서드가 기술적으로 존재하며 메서드를 만들기 위해 더 적은 작업을 수행해야 하지만 메서드를 직접 구현해야 하므로 더 많은 시간이 걸릴 수 있습니다.

**Copilot 리팩터링 구현**은 GitHub Copilot의 도움을 받아 메서드에 *고기를 추가하거나* 자동으로 구현할 수 있도록 하여 이 시나리오에서 생산성을 높이는 것을 목표로 합니다. 빈 메서드가 `NotImplementedException` throw만 포함하고 있을 때, 해당 `throw` 라인에서 전구 아이콘(`CTRL+.`)을 선택하고 **Copilot 리팩터링 구현**을 선택하면 Copilot이 기존 코드베이스, 메서드 이름 등을 기반으로 메서드의 모든 내용을 자동으로 채워줍니다.

![Copilot 리팩터링 구현](../media/implement-with-copilot.mp4)

### 이 작업을 시도해 보시겠습니까?
GitHub Copilot Free를 활성화하고 이 AI 기능의 잠금을 해제합니다.
평가판 없음 신용카드 없음. 귀하의 GitHub 계정만. [Copilot 무료로 사용하기](https://github.com/settings/copilot).
