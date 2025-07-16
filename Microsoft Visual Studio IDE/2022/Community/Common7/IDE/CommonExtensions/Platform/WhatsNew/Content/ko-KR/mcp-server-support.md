---
description: 컨텍스트를 공유하고 데이터에 액세스하며 지능형 기능을 구동하는 표준화된 방법인 새로운 모델 컨텍스트 프로토콜(MCP)을 사용하여 Visual Studio를 AI 에이전트에 연결합니다.
area: GitHub Copilot
title: MCP Server 지원
thumbnailImage: ../media/mcp-support-thumbnail.png
featureId: mcp-server-support

---


이제 Visual Studio는 MCP 서버를 지원하며 더 스마트하고 연결된 AI 개발을 가능하게 합니다. MCP는 앱과 AI 에이전트가 컨텍스트를 공유하고 조치를 취하는 방법을 표준화하는 개방형 프로토콜입니다. 

Visual Studio에서 MCP를 사용하면 로그, 테스트 실패, PR 또는 각종 문제 등의 정보를 MCP 서버에서 검색하는 것 이상의 작업을 수행할 수 있습니다. 또한 이 정보를 사용하여 코드, IDE 및 스택 전체의 연결된 시스템에서 **의미 있는 작업**을 실행 할 수 있습니다.

![MCP](../media/mcp-support.png)

### MCP 서버 설정

솔루션에 `mcp.json` 파일을 추가하면 Visual Studio에서 해당 파일을 자동으로 검색합니다. 또한 `.vscode/mcp.json`와 같은 다른 환경의 구성도 인식합니다.

### MCP 서버 사용

연결된 MCP 서버를 보려면 Copilot Chat 패널에서 **도구** 드롭다운을 엽니다. 여기에서, Copilot는 컨텍스트를 끌어오고 기존 시스템을 사용하여 작업을 실행할 수 있습니다.

**참고:** MCP 서버에 액세스하고 상호 작용하려면 *에이전트 모드*에 있어야 합니다.

---

Visual Studio를 종료하지 않고 스택의 모든 기능을 Copilot에 불러옵니다.

### 이 작업을 시도해 보시겠습니까?
GitHub Copilot Free를 활성화하고 이 AI 기능의 잠금을 해제합니다.
평가판 없음 신용카드 없음. 귀하의 GitHub 계정만. [Copilot 무료로 사용하기](https://github.com/settings/copilot).
